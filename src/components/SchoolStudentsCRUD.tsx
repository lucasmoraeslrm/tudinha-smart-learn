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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, UserPlus, Edit, Trash2, Search, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Student {
  id: string;
  name: string;
  email?: string;
  codigo?: string;
  ra?: string;
  ano_letivo?: string;
  turma?: string;
  turma_id?: string;
  data_nascimento?: string;
  password_hash?: string;
  escola_id: string;
  ativo: boolean;
  created_at: string;
  // Dados da turma via JOIN
  turma_nome?: string;
  turma_serie?: string;
  turma_ano_letivo?: string;
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
    ra: '',
    password: '',
    turma_id: '',
    data_nascimento: '',
    ativo: true
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
        .select(`
          *,
          turmas!students_turma_id_fkey (
            nome,
            serie,
            ano_letivo
          )
        `)
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados da turma para o formato esperado
      const mappedStudents = (data || []).map(student => ({
        ...student,
        turma_nome: student.turmas?.nome,
        turma_serie: student.turmas?.serie,
        turma_ano_letivo: student.turmas?.ano_letivo
      }));
      
      setStudents(mappedStudents || []);
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
      const normalizedRA = (formData.ra || '').trim();

      // Verificação de duplicidade de RA antes de salvar
      if (normalizedRA) {
        const { data: existing, error: checkError } = await supabase
          .from('students')
          .select('id')
          .eq('ra', normalizedRA);

        if (checkError) throw checkError;

        const conflict =
          existing && existing.length > 0
            ? (editingStudent
              ? existing.some((s: { id: string }) => s.id !== editingStudent.id)
              : true)
            : false;

        if (conflict) {
          toast({
            variant: 'destructive',
            title: 'RA já cadastrado',
            description: 'O RA informado já está sendo usado por outro aluno. Escolha outro valor.'
          });
          return;
        }
      }

      const studentData = {
        name: formData.name,
        ra: normalizedRA || null,
        turma_id: formData.turma_id || null,
        data_nascimento: formData.data_nascimento || null,
        ativo: formData.ativo,
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
          title: 'Aluno atualizado',
          description: 'Os dados do aluno foram atualizados com sucesso'
        });
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;

        toast({
          title: 'Aluno cadastrado',
          description: 'Novo aluno foi cadastrado com sucesso'
        });
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      setFormData({
        name: '',
        ra: '',
        password: '',
        turma_id: '',
        data_nascimento: '',
        ativo: true
      });
      fetchStudents();
    } catch (error: any) {
      const message =
        typeof error?.message === 'string' &&
        error.message.includes('duplicate key value')
          ? 'RA já está em uso. Tente outro.'
          : error?.message || 'Erro inesperado ao salvar';

      toast({
        variant: 'destructive',
        title: 'Erro ao salvar aluno',
        description: message
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      ra: student.ra || '',
      password: '',
      turma_id: student.turma_id || '',
      data_nascimento: student.data_nascimento || '',
      ativo: student.ativo
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
    student.ra?.toLowerCase().includes(searchTerm.toLowerCase())
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
                  ra: '',
                  password: '',
                  turma_id: '',
                  data_nascimento: '',
                  ativo: true
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
                   <Label htmlFor="ra">RA *</Label>
                   <Input
                     id="ra"
                     value={formData.ra}
                     onChange={(e) => setFormData({ ...formData, ra: e.target.value })}
                     required
                   />
                 </div>
                 <div>
                   <Label htmlFor="password">Senha {!editingStudent && '*'}</Label>
                   <Input
                     id="password"
                     type="password"
                     value={formData.password}
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     required={!editingStudent}
                     placeholder={editingStudent ? "Deixe em branco para manter" : ""}
                   />
                 </div>
                 <div>
                   <Label htmlFor="ativo">Status</Label>
                   <Select value={formData.ativo.toString()} onValueChange={(value) => setFormData({ ...formData, ativo: value === 'true' })}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="true">Ativo</SelectItem>
                       <SelectItem value="false">Inativo</SelectItem>
                     </SelectContent>
                   </Select>
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
                             {turma.serie} - {turma.nome} - {turma.ano_letivo}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div>
                     <Label htmlFor="data_nascimento">Data de Aniversário</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.data_nascimento && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.data_nascimento ? (
                              format(new Date(formData.data_nascimento), "dd/MM/yyyy")
                           ) : (
                             <span>dd/mm/aaaa</span>
                           )}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={formData.data_nascimento ? new Date(formData.data_nascimento) : undefined}
                           onSelect={(date) => setFormData({ 
                             ...formData, 
                             data_nascimento: date ? format(date, "yyyy-MM-dd") : "" 
                           })}
                           disabled={(date) =>
                             date > new Date() || date < new Date("1900-01-01")
                           }
                           initialFocus
                           className={cn("p-3 pointer-events-auto")}
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
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
              placeholder="Buscar por nome ou RA..."
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
                <TableHead>RA</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                   <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.ra || '-'}</TableCell>
                       <TableCell>
                         {student.turma_nome ? (
                           <Badge variant="secondary">
                             {student.turma_serie} - {student.turma_nome} - {student.turma_ano_letivo}
                           </Badge>
                         ) : '-'}
                       </TableCell>
                       <TableCell>
                         <Badge variant={student.ativo ? "default" : "secondary"}>
                           {student.ativo ? "Ativo" : "Inativo"}
                         </Badge>
                       </TableCell>
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