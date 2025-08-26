import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Eye, EyeOff, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEscola } from '@/hooks/useEscola';

const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  codigo: z.string().min(3, 'Código deve ter pelo menos 3 caracteres'),
  password: z.string().min(4, 'Senha deve ter pelo menos 4 caracteres'),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface Professor {
  id: string;
  nome: string;
  email?: string;
  codigo: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

const AdminProfessores = () => {
  const { escola } = useEscola();
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      codigo: '',
      password: '',
      ativo: true,
    },
  });

  useEffect(() => {
    carregarProfessores();
  }, []);

  const carregarProfessores = async () => {
    try {
      let query = supabase.from('professores').select('*');
      
      if (escola?.id) {
        query = query.eq('escola_id', escola.id);
      }
      
      const { data, error } = await query.order('nome');

      if (error) throw error;
      setProfessores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar professores",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const professorData = {
        nome: data.nome,
        email: data.email || null,
        codigo: data.codigo,
        password_hash: data.password, // Em produção, deveria ser hash
        ativo: data.ativo,
        escola_id: escola?.id || null,
      };

      if (editingProfessor) {
        const { error } = await supabase
          .from('professores')
          .update(professorData)
          .eq('id', editingProfessor.id);

        if (error) throw error;

        toast({
          title: "Professor atualizado",
          description: "Professor atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('professores')
          .insert([professorData]);

        if (error) throw error;

        toast({
          title: "Professor cadastrado",
          description: "Professor cadastrado com sucesso",
        });
      }

      setDialogOpen(false);
      setEditingProfessor(null);
      form.reset();
      carregarProfessores();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar professor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    form.reset({
      nome: professor.nome,
      email: professor.email || '',
      codigo: professor.codigo,
      password: '', // Não carregamos a senha por segurança
      ativo: professor.ativo,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (professor: Professor) => {
    if (!confirm(`Tem certeza que deseja excluir o professor ${professor.nome}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', professor.id);

      if (error) throw error;

      toast({
        title: "Professor excluído",
        description: "Professor excluído com sucesso",
      });

      carregarProfessores();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir professor",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (professor: Professor) => {
    try {
      const { error } = await supabase
        .from('professores')
        .update({ ativo: !professor.ativo })
        .eq('id', professor.id);

      if (error) throw error;

      toast({
        title: professor.ativo ? "Professor desativado" : "Professor ativado",
        description: `Professor ${professor.ativo ? 'desativado' : 'ativado'} com sucesso`,
      });

      carregarProfessores();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando professores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Professores</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os professores do sistema
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingProfessor(null);
                form.reset();
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
              </DialogTitle>
              <DialogDescription>
                {editingProfessor 
                  ? 'Edite as informações do professor'
                  : 'Preencha os dados do novo professor'
                }
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do professor" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@escola.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código do Professor</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="PROF001" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Digite a senha" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Professor Ativo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Professor poderá fazer login no sistema
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProfessor ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Professores ({professores.length})
          </CardTitle>
          <CardDescription>
            Gerencie todos os professores cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {professores.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum professor cadastrado ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professores.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.nome}</TableCell>
                    <TableCell>{professor.codigo}</TableCell>
                    <TableCell>{professor.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={professor.ativo ? "default" : "secondary"}>
                        {professor.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(professor)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(professor)}
                        >
                          {professor.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(professor)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfessores;