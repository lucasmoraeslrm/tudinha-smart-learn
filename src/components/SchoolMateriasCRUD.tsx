import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Edit, Trash2, Search } from 'lucide-react';

interface Materia {
  id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  ativo: boolean;
  escola_id: string;
  created_at: string;
}

interface SchoolMateriasCRUDProps {
  schoolId: string;
}

export default function SchoolMateriasCRUD({ schoolId }: SchoolMateriasCRUDProps) {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    ativo: true
  });

  useEffect(() => {
    fetchMaterias();
  }, [schoolId]);

  const fetchMaterias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('materias')
        .select('*')
        .eq('escola_id', schoolId)
        .order('nome');

      if (error) throw error;
      setMaterias(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar matérias",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const materiaData = {
        ...formData,
        escola_id: schoolId
      };

      if (editingMateria) {
        const { error } = await supabase
          .from('materias')
          .update(materiaData)
          .eq('id', editingMateria.id);

        if (error) throw error;

        toast({
          title: "Matéria atualizada",
          description: "A matéria foi atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('materias')
          .insert([materiaData]);

        if (error) throw error;

        toast({
          title: "Matéria cadastrada",
          description: "Nova matéria foi cadastrada com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingMateria(null);
      resetForm();
      fetchMaterias();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar matéria",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      ativo: true
    });
  };

  const handleEdit = (materia: Materia) => {
    setEditingMateria(materia);
    setFormData({
      nome: materia.nome,
      codigo: materia.codigo,
      descricao: materia.descricao || '',
      ativo: materia.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Matéria removida",
        description: "A matéria foi removida com sucesso"
      });
      fetchMaterias();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover matéria",
        description: error.message
      });
    }
  };

  const filteredMaterias = materias.filter(materia =>
    materia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Matérias
            </CardTitle>
            <CardDescription>
              Gerencie as matérias da escola
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Matéria
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingMateria ? 'Editar Matéria' : 'Nova Matéria'}
                </DialogTitle>
                <DialogDescription>
                  {editingMateria ? 'Atualize os dados da matéria' : 'Cadastre uma nova matéria na escola'}
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
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Matéria ativa</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingMateria ? 'Atualizar' : 'Cadastrar'}
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
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando matérias...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhuma matéria encontrada' : 'Nenhuma matéria cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterias.map((materia) => (
                  <TableRow key={materia.id}>
                    <TableCell className="font-medium">{materia.nome}</TableCell>
                    <TableCell>{materia.codigo}</TableCell>
                    <TableCell>{materia.descricao || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={materia.ativo ? "default" : "secondary"}>
                        {materia.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(materia)}
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
                                Tem certeza que deseja remover a matéria "{materia.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(materia.id)}>
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