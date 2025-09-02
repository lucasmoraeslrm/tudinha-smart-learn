import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Plus, Edit, Trash2, Play, Copy, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

interface ProfessorJornadasProps {
  professorData: any;
}

export default function ProfessorJornadas({ professorData }: ProfessorJornadasProps) {
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJornada, setEditingJornada] = useState<any>(null);
  const [formData, setFormData] = useState({
    aula_titulo: '',
    materia: '',
    assunto: '',
    serie_ano_letivo: '',
    serie_turma: '',
    exercise_ids: [] as string[]
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

      // Carregar exercícios disponíveis
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (exercisesError) {
        console.error('Erro ao carregar exercícios:', exercisesError);
      } else {
        setExercises(exercisesData || []);
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
      serie_turma: '',
      exercise_ids: []
    });
    setSelectedExercises([]);
    setEditingJornada(null);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    const newSelected = selectedExercises.includes(exerciseId)
      ? selectedExercises.filter(id => id !== exerciseId)
      : [...selectedExercises, exerciseId];
    
    setSelectedExercises(newSelected);
    setFormData({...formData, exercise_ids: newSelected});
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    exercise.subject.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    exercise.question.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

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
        exercise_ids: selectedExercises,
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
    
    // Definir exercícios selecionados
    const exerciseIds = jornada.exercise_ids || [];
    setSelectedExercises(exerciseIds);
    
    setFormData({
      aula_titulo: jornada.aula_titulo || '',
      materia: materia?.id || '',
      assunto: jornada.assunto || '',
      serie_ano_letivo: jornada.serie_ano_letivo || '',
      serie_turma: turma?.id || '',
      exercise_ids: exerciseIds
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
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Jornadas</h1>
          <p className="text-muted-foreground">
            Crie jornadas por série e gerencie exercícios específicos
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Exercício
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Jornada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-background border z-50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingJornada ? 'Editar Jornada' : 'Criar Nova Jornada por Série'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Configure uma nova jornada de aprendizagem para uma série inteira
                </p>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turma">Série*</Label>
                    <Select
                      value={formData.serie_turma}
                      onValueChange={(value) => setFormData({...formData, serie_turma: value})}
                    >
                      <SelectTrigger className="bg-background border z-50">
                        <SelectValue placeholder="Selecione uma série" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.serie} {turma.ano_letivo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="materia">Matéria*</Label>
                    <Select
                      value={formData.materia}
                      onValueChange={(value) => setFormData({...formData, materia: value})}
                    >
                      <SelectTrigger className="bg-background border z-50">
                        <SelectValue placeholder="Selecione a matéria" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título da Aula*</Label>
                  <Input
                    id="titulo"
                    value={formData.aula_titulo}
                    onChange={(e) => setFormData({...formData, aula_titulo: e.target.value})}
                    placeholder="Ex: Introdução às equações quadráticas"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assunto">Assunto</Label>
                  <Textarea
                    id="assunto"
                    value={formData.assunto}
                    onChange={(e) => setFormData({...formData, assunto: e.target.value})}
                    placeholder="Descreva o assunto que será abordado na jornada"
                    rows={3}
                  />
                </div>

                {/* Seleção de Exercícios */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">Exercícios</Label>
                    <Badge variant="secondary">
                      {selectedExercises.length} selecionado{selectedExercises.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar exercícios..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {filteredExercises.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="h-8 w-8 mx-auto mb-2" />
                          <p>Nenhum exercício encontrado</p>
                        </div>
                      ) : (
                        filteredExercises.map((exercise) => (
                          <div key={exercise.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50">
                            <Checkbox
                              id={exercise.id}
                              checked={selectedExercises.includes(exercise.id)}
                              onCheckedChange={() => handleExerciseToggle(exercise.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={exercise.id}
                                className="block text-sm font-medium cursor-pointer"
                              >
                                {exercise.title}
                              </label>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {exercise.question}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {exercise.subject}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.difficulty === 'easy' ? 'Fácil' : 
                                   exercise.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingJornada ? 'Atualizar' : 'Criar Jornada'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs para Jornadas e Exercícios */}
      <Tabs defaultValue="jornadas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jornadas">Jornadas</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jornadas" className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, matéria ou série..."
                className="pl-10"
              />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-series">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as Séries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-series">Todas as Séries</SelectItem>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.serie} {turma.ano_letivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Jornadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Jornadas ({jornadas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jornadas.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Nenhuma jornada encontrada</p>
                  <p className="text-sm text-muted-foreground">Crie a primeira jornada para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jornadas.map((jornada) => (
                    <div key={jornada.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{jornada.aula_titulo}</h4>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{jornada.materia}</Badge>
                            <Badge className={getStatusColor(jornada.status)}>
                              {jornada.status?.replace('_', ' ')}
                            </Badge>
                            {jornada.exercise_ids && jornada.exercise_ids.length > 0 && (
                              <Badge variant="secondary">
                                {jornada.exercise_ids.length} exercício{jornada.exercise_ids.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercicios" className="space-y-4">
          {/* Lista de Exercícios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Exercícios Disponíveis ({exercises.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{exercise.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exercise.question}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{exercise.subject}</Badge>
                            <Badge variant="secondary">
                              {exercise.difficulty === 'easy' ? 'Fácil' : 
                               exercise.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {exercise.explanation && (
                        <div className="mt-3 p-3 bg-muted/50 rounded">
                          <p className="text-sm">
                            <strong>Explicação:</strong> {exercise.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}