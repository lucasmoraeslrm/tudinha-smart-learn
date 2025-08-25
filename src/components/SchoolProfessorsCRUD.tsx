import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, UserPlus, Edit, Trash2, Search, X } from 'lucide-react';

interface Professor {
  id: string;
  nome: string;
  email?: string;
  codigo: string;
  materias?: string[];
  ativo: boolean;
  escola_id: string;
  password_hash: string;
  created_at: string;
}

interface SchoolProfessorsCRUDProps {
  schoolId: string;
}

export default function SchoolProfessorsCRUD({ schoolId }: SchoolProfessorsCRUDProps) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [currentMateria, setCurrentMateria] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    codigo: '',
    materias: [] as string[],
    ativo: true,
    password: ''
  });

  useEffect(() => {
    fetchProfessors();
  }, [schoolId]);

  const fetchProfessors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfessors(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar professores",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const professorData = {
        nome: formData.nome,
        email: formData.email || null,
        codigo: formData.codigo,
        materias: formData.materias,
        ativo: formData.ativo,
        escola_id: schoolId,
        ...(formData.password && { password_hash: formData.password }) // In production, hash this properly
      };

      if (editingProfessor) {
        const { error } = await supabase
          .from('professores')
          .update(professorData)
          .eq('id', editingProfessor.id);

        if (error) throw error;

        toast({
          title: "Professor atualizado",
          description: "Os dados do professor foram atualizados com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('professores')
          .insert([{ ...professorData, password_hash: formData.password || 'temp_password' }]);

        if (error) throw error;

        toast({
          title: "Professor cadastrado",
          description: "Novo professor foi cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingProfessor(null);
      resetForm();
      fetchProfessors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar professor",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      codigo: '',
      materias: [],
      ativo: true,
      password: ''
    });
    setCurrentMateria('');
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      nome: professor.nome,
      email: professor.email || '',
      codigo: professor.codigo,
      materias: professor.materias || [],
      ativo: professor.ativo,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Professor removido",
        description: "O professor foi removido com sucesso"
      });
      fetchProfessors();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover professor",
        description: error.message
      });
    }
  };

  const addMateria = () => {
    if (currentMateria.trim() && !formData.materias.includes(currentMateria.trim())) {
      setFormData({
        ...formData,
        materias: [...formData.materias, currentMateria.trim()]
      });
      setCurrentMateria('');
    }
  };

  const removeMateria = (materia: string) => {
    setFormData({
      ...formData,
      materias: formData.materias.filter(m => m !== materia)
    });
  };

  const filteredProfessors = professors.filter(professor =>
    professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Professores
            </CardTitle>
            <CardDescription>
              Gerencie os professores da escola
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Professor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
                </DialogTitle>
                <DialogDescription>
                  {editingProfessor ? 'Atualize os dados do professor' : 'Cadastre um novo professor na escola'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    {editingProfessor ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingProfessor}
                  />
                </div>
                <div>
                  <Label>Matérias</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentMateria}
                      onChange={(e) => setCurrentMateria(e.target.value)}
                      placeholder="Digite uma matéria"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMateria())}
                    />
                    <Button type="button" onClick={addMateria} size="sm">
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.materias.map((materia) => (
                      <Badge key={materia} variant="secondary" className="flex items-center gap-1">
                        {materia}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeMateria(materia)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Professor ativo</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingProfessor ? 'Atualizar' : 'Cadastrar'}
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
            <div className="text-muted-foreground">Carregando professores...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Matérias</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfessors.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.nome}</TableCell>
                    <TableCell>{professor.codigo}</TableCell>
                    <TableCell>{professor.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {professor.materias?.map((materia) => (
                          <Badge key={materia} variant="outline" className="text-xs">
                            {materia}
                          </Badge>
                        )) || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={professor.ativo ? "default" : "secondary"}>
                        {professor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(professor)}
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
                                Tem certeza que deseja remover o professor "{professor.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(professor.id)}>
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