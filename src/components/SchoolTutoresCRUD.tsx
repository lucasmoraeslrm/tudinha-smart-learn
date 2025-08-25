import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, UserPlus, Edit, Trash2, Search } from 'lucide-react';

interface Tutor {
  id: string;
  nome: string;
  email?: string;
  password_hash: string;
  tipo: 'pai' | 'mae' | 'irmao' | 'outro';
  telefone?: string;
  ativo: boolean;
  escola_id: string;
  created_at: string;
}

interface SchoolTutoresCRUDProps {
  schoolId: string;
}

export default function SchoolTutoresCRUD({ schoolId }: SchoolTutoresCRUDProps) {
  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    tipo: 'pai' as 'pai' | 'mae' | 'irmao' | 'outro',
    telefone: '',
    ativo: true
  });

  useEffect(() => {
    fetchTutores();
  }, [schoolId]);

  const fetchTutores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutores')
        .select('*')
        .eq('escola_id', schoolId)
        .order('nome');

      if (error) throw error;
      setTutores((data || []) as Tutor[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tutores",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tutorData = {
        nome: formData.nome,
        email: formData.email || null,
        tipo: formData.tipo,
        telefone: formData.telefone || null,
        ativo: formData.ativo,
        escola_id: schoolId,
        ...(formData.password && { password_hash: formData.password }) // In production, hash this properly
      };

      if (editingTutor) {
        const { error } = await supabase
          .from('tutores')
          .update(tutorData)
          .eq('id', editingTutor.id);

        if (error) throw error;

        toast({
          title: "Tutor atualizado",
          description: "Os dados do tutor foram atualizados com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('tutores')
          .insert([{ ...tutorData, password_hash: formData.password || 'temp_password' }]);

        if (error) throw error;

        toast({
          title: "Tutor cadastrado",
          description: "Novo tutor foi cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingTutor(null);
      resetForm();
      fetchTutores();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar tutor",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      password: '',
      tipo: 'pai',
      telefone: '',
      ativo: true
    });
  };

  const handleEdit = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setFormData({
      nome: tutor.nome,
      email: tutor.email || '',
      password: '',
      tipo: tutor.tipo,
      telefone: tutor.telefone || '',
      ativo: tutor.ativo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tutores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tutor removido",
        description: "O tutor foi removido com sucesso"
      });
      fetchTutores();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover tutor",
        description: error.message
      });
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      pai: 'Pai',
      mae: 'Mãe',
      irmao: 'Irmão/Irmã',
      outro: 'Outro'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const getTipoBadgeVariant = (tipo: string) => {
    const variants = {
      pai: 'default',
      mae: 'secondary', 
      irmao: 'outline',
      outro: 'destructive'
    };
    return variants[tipo as keyof typeof variants] || 'default';
  };

  const filteredTutores = tutores.filter(tutor =>
    tutor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.telefone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Tutores
            </CardTitle>
            <CardDescription>
              Gerencie os tutores (pais, mães, responsáveis) da escola
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingTutor ? 'Editar Tutor' : 'Novo Tutor'}
                </DialogTitle>
                <DialogDescription>
                  {editingTutor ? 'Atualize os dados do tutor' : 'Cadastre um novo tutor na escola'}
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
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="irmao">Irmão/Irmã</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">
                    {editingTutor ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingTutor}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Tutor ativo</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingTutor ? 'Atualizar' : 'Cadastrar'}
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
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando tutores...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum tutor encontrado' : 'Nenhum tutor cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTutores.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.nome}</TableCell>
                    <TableCell>{tutor.email || '-'}</TableCell>
                    <TableCell>{tutor.telefone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getTipoBadgeVariant(tutor.tipo) as any}>
                        {getTipoLabel(tutor.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tutor.ativo ? "default" : "secondary"}>
                        {tutor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(tutor)}
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
                                Tem certeza que deseja remover o tutor "{tutor.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(tutor.id)}>
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