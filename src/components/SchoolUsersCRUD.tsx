import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff 
} from 'lucide-react';

interface SchoolUser {
  id: string;
  user_id?: string;
  full_name: string;
  role: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

interface NewUser {
  email: string;
  password: string;
  full_name: string;
  role: 'school_admin' | 'coordinator';
}

export default function SchoolUsersCRUD() {
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    password: '',
    full_name: '',
    role: 'coordinator'
  });

  const { toast } = useToast();
  const { escola } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [escola?.id]);

  const loadUsers = async () => {
    if (!escola?.id) return;
    
    try {
      setLoading(true);
      
      // Buscar coordenadores da escola (que são os usuários de acesso)
      const { data, error } = await supabase
        .from('coordenadores')
        .select('*')
        .eq('escola_id', escola.id)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear dados dos coordenadores para o formato esperado
      const mappedUsers: SchoolUser[] = (data || []).map(coord => ({
        id: coord.id,
        full_name: coord.nome,
        role: coord.funcao === 'diretor' ? 'school_admin' : 'coordinator',
        email: coord.email,
        created_at: coord.created_at,
        updated_at: coord.updated_at
      }));
      
      setUsers(mappedUsers);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!escola?.id) return;
    
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);

      // Gerar código único para o coordenador
      const codigo = `${newUser.role.toUpperCase()}${Date.now()}`;

      // Criar coordenador na tabela coordenadores
      const { error } = await supabase
        .from('coordenadores')
        .insert({
          nome: newUser.full_name,
          email: newUser.email,
          codigo: codigo,
          funcao: newUser.role === 'school_admin' ? 'diretor' : 'coordenador',
          password_hash: newUser.password, // Em produção, isso deveria ser hasheado
          escola_id: escola.id,
          ativo: true,
          permissoes: {
            acesso_total: newUser.role === 'school_admin',
            cadastro_aluno: newUser.role === 'school_admin',
            cadastro_professor: newUser.role === 'school_admin',
            financeiro: newUser.role === 'school_admin'
          }
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });

      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'coordinator'
      });
      setIsDialogOpen(false);
      loadUsers();

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !escola?.id) return;

    try {
      const { error } = await supabase
        .from('coordenadores')
        .update({
          nome: editingUser.full_name,
          funcao: editingUser.role === 'school_admin' ? 'diretor' : 'coordenador',
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      setEditingUser(null);
      setIsDialogOpen(false);
      loadUsers();

    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (user: SchoolUser) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.full_name}"?`)) {
      return;
    }

    try {
      // Desativar o coordenador em vez de deletar
      const { error } = await supabase
        .from('coordenadores')
        .update({ ativo: false })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      loadUsers();

    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'school_admin':
        return 'bg-red-100 text-red-800';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'school_admin':
        return 'Admin da Escola';
      case 'coordinator':
        return 'Coordenador';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Usuários de Acesso</h2>
          <p className="text-muted-foreground">
            Gerencie usuários que podem acessar o painel administrativo da escola
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setEditingUser(null)}>
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {!editingUser && (
                <>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="usuario@escola.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Senha do usuário"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={editingUser ? editingUser.full_name : newUser.full_name}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, full_name: e.target.value });
                    } else {
                      setNewUser({ ...newUser, full_name: e.target.value });
                    }
                  }}
                  placeholder="Nome completo do usuário"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Função</Label>
                <Select
                  value={editingUser ? editingUser.role : newUser.role}
                  onValueChange={(value: 'school_admin' | 'coordinator') => {
                    if (editingUser) {
                      setEditingUser({ ...editingUser, role: value });
                    } else {
                      setNewUser({ ...newUser, role: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordinator">Coordenador</SelectItem>
                    <SelectItem value="school_admin">Admin da Escola</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingUser(null);
                    setNewUser({
                      email: '',
                      password: '',
                      full_name: '',
                      role: 'coordinator'
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={editingUser ? handleUpdateUser : handleCreateUser}
                  disabled={creating}
                >
                  {creating ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Usuários de Acesso ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Função</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Criado em</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário de acesso encontrado.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}