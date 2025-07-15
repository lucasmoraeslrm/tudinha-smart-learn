import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, UserPlus, Trash2, Users } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  codigo?: string;
  ano_letivo?: string;
  turma?: string;
  created_at: string;
}

export function ManageStudents() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUserCredentials, setNewUserCredentials] = useState({
    fullName: '',
    codigo: '',
    password: '',
    anoLetivo: '',
    turma: '',
  });
  const { toast } = useToast();
  const { signUp } = useAuth();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudentWithLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Criar a conta de usuário com os dados adicionais
      const { error: authError } = await signUp(
        `${newUserCredentials.codigo}@estudante.local`, // Email temporário baseado no código
        newUserCredentials.password,
        newUserCredentials.fullName,
        'student',
        newUserCredentials.codigo,
        newUserCredentials.anoLetivo,
        newUserCredentials.turma
      );

      if (authError) throw authError;

      toast({
        title: "Sucesso",
        description: "Aluno criado com acesso ao sistema! Login será feito com o código.",
      });

      setNewUserCredentials({ 
        fullName: '', 
        codigo: '', 
        password: '', 
        anoLetivo: '', 
        turma: '' 
      });
      loadStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o aluno com login.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const deleteStudent = async (userId: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) {
      return;
    }

    try {
      // Deletar o perfil (o usuário será deletado automaticamente por cascade)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno excluído com sucesso!",
      });

      loadStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o aluno.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createStudentWithLogin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo*</Label>
                <Input
                  id="fullName"
                  value={newUserCredentials.fullName}
                  onChange={(e) => setNewUserCredentials({ ...newUserCredentials, fullName: e.target.value })}
                  placeholder="Nome completo do aluno"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codigo">Código do Aluno*</Label>
                <Input
                  id="codigo"
                  value={newUserCredentials.codigo}
                  onChange={(e) => setNewUserCredentials({ ...newUserCredentials, codigo: e.target.value })}
                  placeholder="Ex: ALU001, 2024001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha*</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserCredentials.password}
                  onChange={(e) => setNewUserCredentials({ ...newUserCredentials, password: e.target.value })}
                  placeholder="Senha para acesso"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anoLetivo">Ano Letivo</Label>
                <Select value={newUserCredentials.anoLetivo} onValueChange={(value) => setNewUserCredentials({ ...newUserCredentials, anoLetivo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select value={newUserCredentials.turma} onValueChange={(value) => setNewUserCredentials({ ...newUserCredentials, turma: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1A">1º Ano A</SelectItem>
                    <SelectItem value="1B">1º Ano B</SelectItem>
                    <SelectItem value="2A">2º Ano A</SelectItem>
                    <SelectItem value="2B">2º Ano B</SelectItem>
                    <SelectItem value="3A">3º Ano A</SelectItem>
                    <SelectItem value="3B">3º Ano B</SelectItem>
                    <SelectItem value="6A">6º Ano A</SelectItem>
                    <SelectItem value="6B">6º Ano B</SelectItem>
                    <SelectItem value="7A">7º Ano A</SelectItem>
                    <SelectItem value="7B">7º Ano B</SelectItem>
                    <SelectItem value="8A">8º Ano A</SelectItem>
                    <SelectItem value="8B">8º Ano B</SelectItem>
                    <SelectItem value="9A">9º Ano A</SelectItem>
                    <SelectItem value="9B">9º Ano B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Aluno com Login
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alunos Cadastrados ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum aluno cadastrado ainda.
            </p>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{student.full_name}</h3>
                      {student.codigo && (
                        <Badge variant="secondary" className="text-xs">
                          Código: {student.codigo}
                        </Badge>
                      )}
                      {student.turma && (
                        <Badge variant="outline" className="text-xs">
                          {student.turma}
                        </Badge>
                      )}
                      {student.ano_letivo && (
                        <Badge variant="outline" className="text-xs">
                          {student.ano_letivo}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Criado em: {new Date(student.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteStudent(student.user_id, student.full_name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}