import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Edit, Trash2, Search, Settings } from 'lucide-react';

interface Coordinator {
  id: string;
  nome: string;
  email?: string;
  codigo: string;
  funcao: string;
  ativo: boolean;
  escola_id: string;
  password_hash: string;
  permissoes?: {
    financeiro: boolean;
    cadastro_professor: boolean;
    cadastro_aluno: boolean;
    acesso_total: boolean;
  };
  created_at: string;
}

interface SchoolCoordinatorsCRUDProps {
  schoolId: string;
}

export default function SchoolCoordinatorsCRUD({ schoolId }: SchoolCoordinatorsCRUDProps) {
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState<Coordinator | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    codigo: '',
    funcao: '',
    ativo: true,
    password: '',
    permissoes: {
      financeiro: false,
      cadastro_professor: false,
      cadastro_aluno: false,
      acesso_total: false
    }
  });

  useEffect(() => {
    fetchCoordinators();
  }, [schoolId]);

  const fetchCoordinators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coordenadores')
        .select('*')
        .eq('escola_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the Json type properly
      const transformedData = (data || []).map(coord => ({
        ...coord,
        permissoes: coord.permissoes ? 
          (typeof coord.permissoes === 'string' ? 
            JSON.parse(coord.permissoes) : 
            coord.permissoes as any) : 
          {
            financeiro: false,
            cadastro_professor: false,
            cadastro_aluno: false,
            acesso_total: false
          }
      })) as Coordinator[];
      
      setCoordinators(transformedData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar coordenadores",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const coordinatorData = {
        nome: formData.nome,
        email: formData.email || null,
        codigo: formData.codigo,
        funcao: formData.funcao,
        ativo: formData.ativo,
        escola_id: schoolId,
        permissoes: formData.permissoes,
        ...(formData.password && { password_hash: formData.password }) // In production, hash this properly
      };

      if (editingCoordinator) {
        const { error } = await supabase
          .from('coordenadores')
          .update(coordinatorData)
          .eq('id', editingCoordinator.id);

        if (error) throw error;

        toast({
          title: "Coordenador atualizado",
          description: "Os dados do coordenador foram atualizados com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('coordenadores')
          .insert([{ ...coordinatorData, password_hash: formData.password || 'temp_password' }]);

        if (error) throw error;

        toast({
          title: "Coordenador cadastrado",
          description: "Novo coordenador foi cadastrado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingCoordinator(null);
      resetForm();
      fetchCoordinators();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar coordenador",
        description: error.message
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      codigo: '',
      funcao: '',
      ativo: true,
      password: '',
      permissoes: {
        financeiro: false,
        cadastro_professor: false,
        cadastro_aluno: false,
        acesso_total: false
      }
    });
  };

  const handleEdit = (coordinator: Coordinator) => {
    setEditingCoordinator(coordinator);
    setFormData({
      nome: coordinator.nome,
      email: coordinator.email || '',
      codigo: coordinator.codigo,
      funcao: coordinator.funcao,
      ativo: coordinator.ativo,
      password: '',
      permissoes: coordinator.permissoes || {
        financeiro: false,
        cadastro_professor: false,
        cadastro_aluno: false,
        acesso_total: false
      }
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coordenadores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Coordenador removido",
        description: "O coordenador foi removido com sucesso"
      });
      fetchCoordinators();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao remover coordenador",
        description: error.message
      });
    }
  };

  const handlePermissionChange = (permission: keyof typeof formData.permissoes, checked: boolean) => {
    setFormData({
      ...formData,
      permissoes: {
        ...formData.permissoes,
        [permission]: checked
      }
    });
  };

  const filteredCoordinators = coordinators.filter(coordinator =>
    coordinator.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionBadges = (permissoes?: Coordinator['permissoes']) => {
    if (!permissoes) return [];
    
    const badges = [];
    if (permissoes.acesso_total) badges.push('Acesso Total');
    if (permissoes.financeiro) badges.push('Financeiro');
    if (permissoes.cadastro_professor) badges.push('Cadastro Professor');
    if (permissoes.cadastro_aluno) badges.push('Cadastro Aluno');
    
    return badges;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Coordenadores
            </CardTitle>
            <CardDescription>
              Gerencie os coordenadores da escola e seus níveis de acesso
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Coordenador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCoordinator ? 'Editar Coordenador' : 'Novo Coordenador'}
                </DialogTitle>
                <DialogDescription>
                  {editingCoordinator ? 'Atualize os dados do coordenador' : 'Cadastre um novo coordenador na escola'}
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
                  <Label htmlFor="funcao">Função *</Label>
                  <Input
                    id="funcao"
                    value={formData.funcao}
                    onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                    placeholder="Ex: Diretor, Coordenador Pedagógico, Vice-diretor"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">
                    {editingCoordinator ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingCoordinator}
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4" />
                    Níveis de Acesso
                  </Label>
                  <div className="space-y-3 border rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="acesso_total"
                        checked={formData.permissoes.acesso_total}
                        onCheckedChange={(checked) => handlePermissionChange('acesso_total', !!checked)}
                      />
                      <Label htmlFor="acesso_total" className="text-sm font-medium">
                        Acesso Total
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="financeiro"
                        checked={formData.permissoes.financeiro}
                        onCheckedChange={(checked) => handlePermissionChange('financeiro', !!checked)}
                      />
                      <Label htmlFor="financeiro" className="text-sm">
                        Módulo Financeiro
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cadastro_professor"
                        checked={formData.permissoes.cadastro_professor}
                        onCheckedChange={(checked) => handlePermissionChange('cadastro_professor', !!checked)}
                      />
                      <Label htmlFor="cadastro_professor" className="text-sm">
                        Cadastro de Professores
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cadastro_aluno"
                        checked={formData.permissoes.cadastro_aluno}
                        onCheckedChange={(checked) => handlePermissionChange('cadastro_aluno', !!checked)}
                      />
                      <Label htmlFor="cadastro_aluno" className="text-sm">
                        Cadastro de Alunos
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label htmlFor="ativo">Coordenador ativo</Label>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingCoordinator ? 'Atualizar' : 'Cadastrar'}
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
              placeholder="Buscar por nome, código, email ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando coordenadores...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoordinators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchTerm ? 'Nenhum coordenador encontrado' : 'Nenhum coordenador cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoordinators.map((coordinator) => (
                  <TableRow key={coordinator.id}>
                    <TableCell className="font-medium">{coordinator.nome}</TableCell>
                    <TableCell>{coordinator.codigo}</TableCell>
                    <TableCell>{coordinator.funcao}</TableCell>
                    <TableCell>{coordinator.email || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getPermissionBadges(coordinator.permissoes).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {getPermissionBadges(coordinator.permissoes).length === 0 && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={coordinator.ativo ? "default" : "secondary"}>
                        {coordinator.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(coordinator)}
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
                                Tem certeza que deseja remover o coordenador "{coordinator.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(coordinator.id)}>
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