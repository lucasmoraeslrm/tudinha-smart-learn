import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, UserPlus, Edit, Trash2, Search } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email?: string;
  codigo?: string;
  ra?: string;
  ano_letivo?: string;
  turma?: string;
  turma_id?: string;
  idade?: number;
  maquina_padrao?: string;
  password_hash?: string;
  escola_id: string;
  created_at: string;
}

interface SchoolStudentsCRUDProps {
  schoolId: string;
}

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  serie: string;
  ano_letivo: string;
}

export default function SchoolStudentsCRUD({ schoolId }: SchoolStudentsCRUDProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    codigo: '',
    ra: '',
    password: '',
    ano_letivo: '',
    turma: '',
    turma_id: '',
    idade: '',
    maquina_padrao: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchTurmas();
  }, [schoolId]);

  const fetchTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('escola_id', schoolId)
        .eq('ativo', true)
        .order('serie', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar alunos",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const studentData = {
        name: formData.name,
        email: formData.email || null,
        codigo: formData.codigo || null,
        ra: formData.ra || null,
        turma_id: formData.turma_id || null,
        ano_letivo: formData.ano_letivo || null,
        turma: formData.turma || null,
        idade: formData.idade ? parseInt(formData.idade) : null,
        maquina_padrao: formData.maquina_padrao || null,
        escola_id: schoolId,
        ...(formData.password && { password_hash: formData.password }) // In production, hash this properly
      };

      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingStudent.id);

        if (error) throw error;

        toast({
          title: "Aluno atualizado",
          description: "Os dados do aluno foram atualizados com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;

        toast({
          title: "Aluno cadastrado",
          description: "Novo aluno foi cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        codigo: '',
        ra: '',
        password: '',
        ano_letivo: '',
        turma: '',
        turma_id: '',
        idade: '',
        maquina_padrao: ''
      });
      fetchStudents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar aluno",
        description: error.message
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email || '',
      codigo: student.codigo || '',
      ra: student.ra || '',
      password: '',
      ano_letivo: student.ano_letivo || '',
      turma: student.turma || '',
      turma_id: student.turma_id || '',
      idade: student.idade?.toString() || '',
      maquina_padrao: student.maquina_padrao || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Aluno removido",
        description: "O aluno foi removido com sucesso"
      });
      fetchStudents();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover aluno",
        description: error.message
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Alunos
            </CardTitle>
            <CardDescription>
              Gerencie os alunos da escola
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingStudent(null);
                setFormData({
                  name: '',
                  email: '',
                  codigo: '',
                  ra: '',
                  password: '',
                  ano_letivo: '',
                  turma: '',
                  turma_id: '',
                  idade: '',
                  maquina_padrao: ''
                });
              }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                </DialogTitle>
                <DialogDescription>
                  {editingStudent ? 'Atualize os dados do aluno' : 'Cadastre um novo aluno na escola'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ra">RA *</Label>
                  <Input
                    id="ra"
                    value={formData.ra}
                    onChange={(e) => setFormData({ ...formData, ra: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingStudent}
                    placeholder={editingStudent ? "Deixe em branco para manter" : ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="turma">Turma</Label>
                    <Select value={formData.turma_id} onValueChange={(value) => setFormData({ ...formData, turma_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.codigo} - {turma.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="idade">Idade</Label>
                    <Input
                      id="idade"
                      type="number"
                      value={formData.idade}
                      onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ano_letivo">Ano Letivo</Label>
                    <Input
                      id="ano_letivo"
                      value={formData.ano_letivo}
                      onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="turma">Turma</Label>
                     <Input
                       id="turma"
                       value={formData.turma}
                       onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                     />
                   </div>
                 </div>
                <div>
                  <Label htmlFor="maquina_padrao">Máquina Padrão</Label>
                  <Input
                    id="maquina_padrao"
                    value={formData.maquina_padrao}
                    onChange={(e) => setFormData({ ...formData, maquina_padrao: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingStudent ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando alunos...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Ano Letivo</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.codigo || '-'}</TableCell>
                    <TableCell>
                      {student.turma ? (
                        <Badge variant="secondary">{student.turma}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{student.ano_letivo || '-'}</TableCell>
                    <TableCell>{student.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o aluno "{student.name}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(student.id)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}