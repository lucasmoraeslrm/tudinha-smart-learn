import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Plus, Edit, Trash2, Play, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ProfessorJornadasProps {
  professorData: any;
}

export default function ProfessorJornadas({ professorData }: ProfessorJornadasProps) {
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJornada, setEditingJornada] = useState<any>(null);
  const [formData, setFormData] = useState({
    aula_titulo: '',
    materia: '',
    assunto: '',
    serie_ano_letivo: '',
    serie_turma: ''
  });

  useEffect(() => {
    carregarJornadas();
  }, [professorData]);

  const carregarJornadas = async () => {
    if (!professorData?.nome) return;

    try {
      const { data, error } = await supabase
        .from('jornadas')
        .select('*')
        .eq('professor_nome', professorData.nome)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar jornadas:', error);
        return;
      }

      setJornadas(data || []);
    } catch (error) {
      console.error('Erro ao carregar jornadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const jornadaData = {
        ...formData,
        professor_nome: professorData.nome,
        status: 'pendente'
      };

      let result;
      if (editingJornada) {
        result = await supabase
          .from('jornadas')
          .update(jornadaData)
          .eq('id', editingJornada.id)
          .select();
      } else {
        result = await supabase
          .from('jornadas')
          .insert([jornadaData])
          .select();
      }

      if (result.error) {
        console.error('Erro ao salvar jornada:', result.error);
        toast.error('Erro ao salvar jornada');
        return;
      }

      toast.success(editingJornada ? 'Jornada atualizada!' : 'Jornada criada!');
      setDialogOpen(false);
      setEditingJornada(null);
      setFormData({
        aula_titulo: '',
        materia: '',
        assunto: '',
        serie_ano_letivo: '',
        serie_turma: ''
      });
      carregarJornadas();
    } catch (error) {
      console.error('Erro ao salvar jornada:', error);
      toast.error('Erro ao salvar jornada');
    }
  };

  const handleEdit = (jornada: any) => {
    setEditingJornada(jornada);
    setFormData({
      aula_titulo: jornada.aula_titulo || '',
      materia: jornada.materia || '',
      assunto: jornada.assunto || '',
      serie_ano_letivo: jornada.serie_ano_letivo || '',
      serie_turma: jornada.serie_turma || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (jornadaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta jornada?')) return;

    try {
      const { error } = await supabase
        .from('jornadas')
        .delete()
        .eq('id', jornadaId);

      if (error) {
        console.error('Erro ao excluir jornada:', error);
        toast.error('Erro ao excluir jornada');
        return;
      }

      toast.success('Jornada excluída!');
      carregarJornadas();
    } catch (error) {
      console.error('Erro ao excluir jornada:', error);
      toast.error('Erro ao excluir jornada');
    }
  };

  const handleDuplicate = async (jornada: any) => {
    try {
      const { id, created_at, updated_at, ...jornadaData } = jornada;
      jornadaData.aula_titulo = `${jornadaData.aula_titulo} (Cópia)`;
      jornadaData.status = 'pendente';

      const { error } = await supabase
        .from('jornadas')
        .insert([jornadaData]);

      if (error) {
        console.error('Erro ao duplicar jornada:', error);
        toast.error('Erro ao duplicar jornada');
        return;
      }

      toast.success('Jornada duplicada!');
      carregarJornadas();
    } catch (error) {
      console.error('Erro ao duplicar jornada:', error);
      toast.error('Erro ao duplicar jornada');
    }
  };

  const handleStart = async (jornadaId: string) => {
    try {
      const { error } = await supabase
        .from('jornadas')
        .update({ status: 'em_andamento', inicio_real: new Date().toISOString() })
        .eq('id', jornadaId);

      if (error) {
        console.error('Erro ao iniciar jornada:', error);
        toast.error('Erro ao iniciar jornada');
        return;
      }

      toast.success('Jornada iniciada!');
      carregarJornadas();
    } catch (error) {
      console.error('Erro ao iniciar jornada:', error);
      toast.error('Erro ao iniciar jornada');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jornadas</h1>
          <p className="text-muted-foreground">
            Gerencie suas jornadas de aprendizado
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingJornada(null);
              setFormData({
                aula_titulo: '',
                materia: '',
                assunto: '',
                serie_ano_letivo: '',
                serie_turma: ''
              });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Jornada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingJornada ? 'Editar Jornada' : 'Nova Jornada'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Aula</Label>
                <Input
                  id="titulo"
                  value={formData.aula_titulo}
                  onChange={(e) => setFormData({...formData, aula_titulo: e.target.value})}
                  placeholder="Ex: Introdução à Matemática"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materia">Matéria</Label>
                <Input
                  id="materia"
                  value={formData.materia}
                  onChange={(e) => setFormData({...formData, materia: e.target.value})}
                  placeholder="Ex: Matemática"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assunto">Assunto</Label>
                <Textarea
                  id="assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData({...formData, assunto: e.target.value})}
                  placeholder="Descreva o assunto da aula..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie">Série/Ano</Label>
                  <Input
                    id="serie"
                    value={formData.serie_ano_letivo}
                    onChange={(e) => setFormData({...formData, serie_ano_letivo: e.target.value})}
                    placeholder="Ex: 9º Ano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="turma">Turma</Label>
                  <Input
                    id="turma"
                    value={formData.serie_turma}
                    onChange={(e) => setFormData({...formData, serie_turma: e.target.value})}
                    placeholder="Ex: A"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingJornada ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Jornadas List */}
      <div className="space-y-4">
        {jornadas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma jornada criada ainda
              </p>
            </CardContent>
          </Card>
        ) : (
          jornadas.map((jornada) => (
            <Card key={jornada.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{jornada.aula_titulo}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{jornada.materia}</Badge>
                      <Badge className={getStatusColor(jornada.status)}>
                        {jornada.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {jornada.status === 'pendente' && (
                      <Button
                        size="sm"
                        onClick={() => handleStart(jornada.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(jornada)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(jornada)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(jornada.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jornada.assunto && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Assunto:</strong> {jornada.assunto}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {jornada.serie_ano_letivo && (
                      <span><strong>Série:</strong> {jornada.serie_ano_letivo}</span>
                    )}
                    {jornada.serie_turma && (
                      <span><strong>Turma:</strong> {jornada.serie_turma}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(jornada.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}