import React, { useState, useEffect, useMemo } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, UserPlus, Edit, Trash2, Search, X } from 'lucide-react';

interface Professor {
  id: string;
  nome: string;
  email?: string;
  codigo: string;
  ativo: boolean;
  escola_id: string;
  password_hash: string;
  created_at: string;
}

export default function AdminProfessores() {
  const { escola } = useAuth();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const { toast } = useToast();

  // Materias and Turmas from DB and mapping professor -> materias/turmas
  const [materiasOptions, setMateriasOptions] = useState<{ id: string; nome: string }[]>([]);
  const [turmasOptions, setTurmasOptions] = useState<{ id: string; nome: string; serie: string }[]>([]);
  const [profMateriasMap, setProfMateriasMap] = useState<Record<string, string[]>>({});
  const [profTurmasMap, setProfTurmasMap] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    codigo: '',
    materiasSelectedIds: [] as string[],
    turmasSelectedIds: [] as string[],
    ativo: true,
    password: ''
  });

  const fetchMateriasOptions = async () => {
    if (!escola?.id) return;
    try {
      const { data, error } = await supabase
        .from('materias')
        .select('id, nome')
        .eq('escola_id', escola.id)
        .eq('ativo', true);
      
      if (error) throw error;
      setMateriasOptions(data || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar matérias', description: error.message });
    }
  };

  const fetchTurmasOptions = async () => {
    if (!escola?.id) return;
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('id, nome, serie')
        .eq('escola_id', escola.id)
        .eq('ativo', true)
        .order('serie')
        .order('nome');
      
      if (error) throw error;
      setTurmasOptions(data || []);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar turmas', description: error.message });
    }
  };

  const fetchProfessors = async () => {
    if (!escola?.id) return;
    
    try {
      setLoading(true);
      const { data: professorsData, error } = await supabase
        .from('professores')
        .select('*')
        .eq('escola_id', escola.id)
        .order('nome');

      if (error) throw error;

      setProfessors(professorsData || []);

      // Fetch professor-materia-turma relationships
      const { data: relData, error: relError } = await supabase
        .from('professor_materia_turma')
        .select('professor_id, materia_id, turma_id')
        .in('professor_id', (professorsData || []).map(p => p.id));

      if (relError) throw relError;

      const matMap: Record<string, string[]> = {};
      const turMap: Record<string, string[]> = {};
      (relData || []).forEach(rel => {
        if (rel.materia_id) {
          if (!matMap[rel.professor_id]) matMap[rel.professor_id] = [];
          matMap[rel.professor_id].push(rel.materia_id);
        }
        if (rel.turma_id) {
          if (!turMap[rel.professor_id]) turMap[rel.professor_id] = [];
          turMap[rel.professor_id].push(rel.turma_id);
        }
      });
      setProfMateriasMap(matMap);
      setProfTurmasMap(turMap);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao carregar professores', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (escola?.id) {
      Promise.all([fetchMateriasOptions(), fetchTurmasOptions(), fetchProfessors()]);
    }
  }, [escola?.id]);

  const materiaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    materiasOptions.forEach(m => map[m.id] = m.nome);
    return map;
  }, [materiasOptions]);

  const turmaNameById = useMemo(() => {
    const map: Record<string, string> = {};
    turmasOptions.forEach(t => map[t.id] = `${t.serie} - ${t.nome}`);
    return map;
  }, [turmasOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escola?.id) return;

    try {
      let professorId = editingProfessor?.id;

      if (editingProfessor) {
        // Update existing professor
        const updateData: any = {
          nome: formData.nome,
          email: formData.email || null,
          codigo: formData.codigo,
          ativo: formData.ativo,
        };

        if (formData.password.trim()) {
          updateData.password_hash = formData.password;
        }

        const { error } = await supabase
          .from('professores')
          .update(updateData)
          .eq('id', editingProfessor.id);

        if (error) throw error;
      } else {
        // Create new professor
        const { data, error } = await supabase
          .from('professores')
          .insert({
            nome: formData.nome,
            email: formData.email || null,
            codigo: formData.codigo,
            ativo: formData.ativo,
            escola_id: escola.id,
            password_hash: formData.password || '123456',
          })
          .select()
          .single();

        if (error) throw error;
        professorId = data.id;
      }

      // Update professor-materia-turma relationships
      if (professorId) {
        await supabase.from('professor_materia_turma').delete().eq('professor_id', professorId);
        
        // Create all combinations of selected materias and turmas
        const inserts = [];
        for (const materiaId of formData.materiasSelectedIds) {
          for (const turmaId of formData.turmasSelectedIds) {
            inserts.push({
              professor_id: professorId,
              materia_id: materiaId,
              turma_id: turmaId,
              ativo: true
            });
          }
        }
        
        if (inserts.length > 0) {
          const { error: relError } = await supabase.from('professor_materia_turma').insert(inserts);
          if (relError) throw relError;
        }
      }

      toast({ title: editingProfessor ? 'Professor atualizado' : 'Professor cadastrado', description: 'Operação realizada com sucesso' });
      setIsDialogOpen(false);
      setEditingProfessor(null);
      resetForm();
      await Promise.all([fetchMateriasOptions(), fetchTurmasOptions(), fetchProfessors()]);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar professor', description: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      codigo: '',
      materiasSelectedIds: [],
      turmasSelectedIds: [],
      ativo: true,
      password: ''
    });
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      nome: professor.nome,
      email: professor.email || '',
      codigo: professor.codigo,
      materiasSelectedIds: profMateriasMap[professor.id] || [],
      turmasSelectedIds: profTurmasMap[professor.id] || [],
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

  const handleMateriaToggle = (materiaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      materiasSelectedIds: checked 
        ? [...prev.materiasSelectedIds, materiaId]
        : prev.materiasSelectedIds.filter(id => id !== materiaId)
    }));
  };

  const handleTurmaToggle = (turmaId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      turmasSelectedIds: checked 
        ? [...prev.turmasSelectedIds, turmaId]
        : prev.turmasSelectedIds.filter(id => id !== turmaId)
    }));
  };

  const filteredProfessors = professors.filter(professor =>
    professor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!escola?.id) {
    return (
      <div className="text-center text-muted-foreground">
        Carregando dados da escola...
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Professores
            </h1>
            <p className="text-muted-foreground">
              Gerencie os professores da escola
            </p>
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
                  {editingProfessor ? 'Edite as informações do professor' : 'Preencha as informações do novo professor'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    {editingProfessor ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required={!editingProfessor}
                  />
                </div>
                
                 {materiasOptions.length > 0 && (
                   <div>
                     <Label>Matérias</Label>
                     <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                       {materiasOptions.map((materia) => (
                         <div key={materia.id} className="flex items-center space-x-2">
                           <Checkbox
                             id={`materia-${materia.id}`}
                             checked={formData.materiasSelectedIds.includes(materia.id)}
                             onCheckedChange={(checked) => handleMateriaToggle(materia.id, checked as boolean)}
                           />
                           <Label htmlFor={`materia-${materia.id}`} className="text-sm">
                             {materia.nome}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 {turmasOptions.length > 0 && (
                   <div>
                     <Label>Turmas</Label>
                     <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                       {turmasOptions.map((turma) => (
                         <div key={turma.id} className="flex items-center space-x-2">
                           <Checkbox
                             id={`turma-${turma.id}`}
                             checked={formData.turmasSelectedIds.includes(turma.id)}
                             onCheckedChange={(checked) => handleTurmaToggle(turma.id, checked as boolean)}
                           />
                           <Label htmlFor={`turma-${turma.id}`} className="text-sm">
                             {turma.serie} - {turma.nome}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
                 
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Ativo</Label>
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
        
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
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
                   <TableHead>Turmas</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Ações</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                 {filteredProfessors.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                       {searchTerm ? 'Nenhum professor encontrado com esse termo de busca' : 'Nenhum professor cadastrado'}
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
                           {(profMateriasMap[professor.id] || []).map((materiaId) => (
                             <Badge key={materiaId} variant="secondary" className="text-xs">
                               {materiaNameById[materiaId] || 'Matéria não encontrada'}
                             </Badge>
                           ))}
                           {(!profMateriasMap[professor.id] || profMateriasMap[professor.id].length === 0) && (
                             <span className="text-muted-foreground text-sm">Nenhuma matéria</span>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex flex-wrap gap-1">
                           {(profTurmasMap[professor.id] || []).map((turmaId) => (
                             <Badge key={turmaId} variant="outline" className="text-xs">
                               {turmaNameById[turmaId] || 'Turma não encontrada'}
                             </Badge>
                           ))}
                           {(!profTurmasMap[professor.id] || profTurmasMap[professor.id].length === 0) && (
                             <span className="text-muted-foreground text-sm">Nenhuma turma</span>
                           )}
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
        </div>
      </div>
  );
}