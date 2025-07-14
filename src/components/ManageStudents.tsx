import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Users, Trash2, Edit, Mail } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email?: string;
  age?: number;
  created_at: string;
}

export function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    age: '',
  });
  const [newUserCredentials, setNewUserCredentials] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const { toast } = useToast();
  const { signUp } = useAuth();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
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

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { error } = await supabase
        .from('students')
        .insert({
          name: newStudent.name,
          email: newStudent.email || null,
          age: newStudent.age ? parseInt(newStudent.age) : null,
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Aluno criado com sucesso!",
      });

      setNewStudent({ name: '', email: '', age: '' });
      loadStudents();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o aluno.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const createStudentWithLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Primeiro criar a conta de usuário
      const { error: authError } = await signUp(
        newUserCredentials.email,
        newUserCredentials.password,
        newUserCredentials.fullName,
        'student'
      );

      if (authError) throw authError;

      // Depois criar o registro na tabela students
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          name: newUserCredentials.fullName,
          email: newUserCredentials.email,
        });

      if (studentError) throw studentError;

      toast({
        title: "Sucesso",
        description: "Aluno criado com acesso ao sistema! Ele precisa verificar o email.",
      });

      setNewUserCredentials({ email: '', password: '', fullName: '' });
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

  const deleteStudent = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

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
            <Users className="h-5 w-5" />
            Gerenciar Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Criar Aluno Simples</TabsTrigger>
              <TabsTrigger value="create-with-login">Criar com Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <form onSubmit={createStudent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo*</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      placeholder="Nome do aluno"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newStudent.age}
                      onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                      placeholder="Ex: 15"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Aluno
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="create-with-login">
              <form onSubmit={createStudentWithLogin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Label htmlFor="userEmail">Email*</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={newUserCredentials.email}
                      onChange={(e) => setNewUserCredentials({ ...newUserCredentials, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="userPassword">Senha*</Label>
                    <Input
                      id="userPassword"
                      type="password"
                      value={newUserCredentials.password}
                      onChange={(e) => setNewUserCredentials({ ...newUserCredentials, password: e.target.value })}
                      placeholder="Senha para acesso"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Criar Aluno com Login
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Lista de alunos */}
      <Card>
        <CardHeader>
          <CardTitle>Alunos Cadastrados ({students.length})</CardTitle>
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{student.name}</h3>
                      {student.email && (
                        <Badge variant="secondary" className="text-xs">
                          {student.email}
                        </Badge>
                      )}
                      {student.age && (
                        <Badge variant="outline" className="text-xs">
                          {student.age} anos
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
                    onClick={() => deleteStudent(student.id, student.name)}
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