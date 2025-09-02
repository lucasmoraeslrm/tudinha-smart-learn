import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Plus, Edit, Trash2, Play, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ProfessorJornadasProps {
  professorData: any;
}

export default function ProfessorJornadas({ professorData }: ProfessorJornadasProps) {
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
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
    carregarDados();
  }, [professorData]);

  const carregarDados = async () => {
    if (!professorData?.id) return;

    try {
      // Carregar jornadas do professor
      const { data: jornadasData, error: jornadasError } = await supabase
        .from('jornadas')
        .select('*')
        .eq('professor_nome', professorData.nome)
        .order('created_at', { ascending: false });

      if (jornadasError) {
        console.error('Erro ao carregar jornadas:', jornadasError);
      } else {
        setJornadas(jornadasData || []);
      }

      // Carregar matérias e turmas do professor
      const { data: pmtData, error: pmtError } = await supabase
        .from('professor_materia_turma')
        .select(`
          *,
          materias (id, nome, codigo),
          turmas (id, nome, codigo, serie, ano_letivo)
        `)
        .eq('professor_id', professorData.id)
        .eq('ativo', true);

      if (pmtError) {
        console.error('Erro ao carregar dados do professor:', pmtError);
      } else {
        // Extrair matérias únicas
        const materiasUnicas = pmtData?.reduce((acc: any[], curr) => {
          const materia = curr.materias;
          if (materia && !acc.find(m => m.id === materia.id)) {
            acc.push(materia);
          }
          return acc;
        }, []) || [];

        // Extrair turmas únicas
        const turmasUnicas = pmtData?.reduce((acc: any[], curr) => {
          const turma = curr.turmas;
          if (turma && !acc.find(t => t.id === turma.id)) {
            acc.push(turma);
          }
          return acc;
        }, []) || [];

        setMaterias(materiasUnicas);
        setTurmas(turmasUnicas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      aula_titulo: '',
      materia: '',
      assunto: '',
      serie_ano_letivo: '',
      serie_turma: ''
    });
    setEditingJornada(null);
  };

  const handleSave = async () => {
    try {
      // Buscar dados da matéria e turma selecionadas
      const materiaSelecionada = materias.find(m => m.id === formData.materia);
      const turmaSelecionada = turmas.find(t => t.id === formData.serie_turma);

      const jornadaData = {
        aula_titulo: formData.aula_titulo,
        materia: materiaSelecionada?.nome || '',
        assunto: formData.assunto,
        serie_ano_letivo: turmaSelecionada?.serie + ' - ' + turmaSelecionada?.ano_letivo || '',
        serie_turma: turmaSelecionada?.nome || '',
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
      resetForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar jornada:', error);
      toast.error('Erro ao salvar jornada');
    }
  };

  const handleEdit = (jornada: any) => {
    setEditingJornada(jornada);
    
    // Encontrar IDs das matérias e turmas
    const materia = materias.find(m => m.nome === jornada.materia);
    const turma = turmas.find(t => t.nome === jornada.serie_turma);
    
    setFormData({
      aula_titulo: jornada.aula_titulo || '',
      materia: materia?.id || '',
      assunto: jornada.assunto || '',
      serie_ano_letivo: jornada.serie_ano_letivo || '',
      serie_turma: turma?.id || ''
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
      carregarDados();
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
      carregarDados();
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
      carregarDados();
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
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Jornada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-background border z-50">
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
                <Select
                  value={formData.materia}
                  onValueChange={(value) => setFormData({...formData, materia: value})}
                >
                  <SelectTrigger className="bg-background border z-50">
                    <SelectValue placeholder="Selecione uma matéria" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {materias.map((materia) => (
                      <SelectItem key={materia.id} value={materia.id}>
                        {materia.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select
                  value={formData.serie_turma}
                  onValueChange={(value) => setFormData({...formData, serie_turma: value})}
                >
                  <SelectTrigger className="bg-background border z-50">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.serie} {turma.ano_letivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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