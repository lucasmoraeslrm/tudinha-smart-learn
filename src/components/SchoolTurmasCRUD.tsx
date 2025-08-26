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
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react';

interface Turma {
  id: string;
  nome: string;
  codigo: string;
  serie: string;
  ano_letivo: string;
  ativo: boolean;
  escola_id: string;
  created_at: string;
}

interface SchoolTurmasCRUDProps {
  schoolId: string;
}

export default function SchoolTurmasCRUD({ schoolId }: SchoolTurmasCRUDProps) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    ano_letivo: '',
    ativo: true
  });

  useEffect(() => {
    fetchTurmas();
  }, [schoolId]);

  const fetchTurmas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('escola_id', schoolId)
        .order('serie', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar turmas",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const turmaData = {
        ...formData,
        codigo: `${formData.serie}${formData.nome}`,
        escola_id: schoolId
      };

      if (editingTurma) {
        const { error } = await supabase
          .from('turmas')
          .update(turmaData)
          .eq('id', editingTurma.id);

        if (error) throw error;

        toast({
          title: "Turma atualizada",
          description: "A turma foi atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('turmas')
          .insert([turmaData]);

        if (error) throw error;

        toast({
          title: "Turma cadastrada",
          description: "Nova turma foi cadastrada com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingTurma(null);
      resetForm();
      fetchTurmas();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar turma",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      serie: '',
      ano_letivo: '',
      ativo: true
    });
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      serie: turma.serie,
      ano_letivo: turma.ano_letivo,
      ativo: turma.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Turma removida",
        description: "A turma foi removida com sucesso"
      });
      fetchTurmas();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover turma",
        description: error.message
      });
    }
  };

  const filteredTurmas = turmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.serie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Turmas
            </CardTitle>
            <CardDescription>
              Gerencie as turmas da escola
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTurma ? 'Editar Turma' : 'Nova Turma'}
                </DialogTitle>
                <DialogDescription>
                  {editingTurma ? 'Atualize os dados da turma' : 'Cadastre uma nova turma na escola'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Turma *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: A, B, C"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serie">Série *</Label>
                    <Input
                      id="serie"
                      value={formData.serie}
                      onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                      placeholder="Ex: 1º, 2º, 3º"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ano_letivo">Ano Letivo *</Label>
                    <Input
                      id="ano_letivo"
                      value={formData.ano_letivo}
                      onChange={(e) => setFormData({ ...formData, ano_letivo: e.target.value })}
                      placeholder="Ex: 2024"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Turma ativa</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingTurma ? 'Atualizar' : 'Cadastrar'}
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
              placeholder="Buscar por nome, código ou série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando turmas...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Ano Letivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTurmas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTurmas.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-medium">{turma.nome}</TableCell>
                    <TableCell>{turma.codigo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{turma.serie}</Badge>
                    </TableCell>
                    <TableCell>{turma.ano_letivo}</TableCell>
                    <TableCell>
                      <Badge variant={turma.ativo ? "default" : "secondary"}>
                        {turma.ativo ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(turma)}
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
                                Tem certeza que deseja remover a turma "{turma.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(turma.id)}>
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