import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, Plus, BookOpen, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  enunciado: string;
  alternativas: any;
  resposta_correta: string;
  explicacao?: string | null;
  ordem: number;
}

interface Topic {
  id: string;
  assunto: string;
  ordem: number;
  exercises: Exercise[];
}

interface Collection {
  id: string;
  materia: string;
  serie_escolar: string;
  topics: Topic[];
}

interface ExerciseManagerProps {
  collectionId: string;
  onBack: () => void;
}

export default function ExerciseManager({ collectionId, onBack }: ExerciseManagerProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ assunto: '' });
  const [exerciseForm, setExerciseForm] = useState({
    enunciado: '',
    alternativas: [
      { letra: 'A', texto: '' },
      { letra: 'B', texto: '' },
      { letra: 'C', texto: '' },
      { letra: 'D', texto: '' }
    ],
    resposta_correta: '',
    explicacao: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_collections')
        .select(`
          *,
          exercise_topics (
            *,
            topic_exercises (*)
          )
        `)
        .eq('id', collectionId)
        .single();

      if (error) throw error;

      const collectionWithTopics = {
        ...data,
        topics: data.exercise_topics?.map((topic: any) => ({
          ...topic,
          exercises: topic.topic_exercises?.sort((a: any, b: any) => a.ordem - b.ordem) || []
        })).sort((a: any, b: any) => a.ordem - b.ordem) || []
      };

      setCollection(collectionWithTopics);
      
      // Set the first topic as selected by default
      if (collectionWithTopics.topics.length > 0) {
        setSelectedTopicId(collectionWithTopics.topics[0].id);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a coleção",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (materia: string, serieEscolar: string) => {
    try {
      const { error } = await supabase
        .from('exercise_collections')
        .update({ materia, serie_escolar: serieEscolar })
        .eq('id', collectionId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Coleção atualizada com sucesso",
      });

      loadCollection();
    } catch (error) {
      console.error('Error updating collection:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a coleção",
        variant: "destructive"
      });
    }
  };

  const handleSaveTopic = async () => {
    try {
      if (editingTopic) {
        // Update existing topic
        const { error } = await supabase
          .from('exercise_topics')
          .update({ assunto: topicForm.assunto })
          .eq('id', editingTopic.id);

        if (error) throw error;
      } else {
        // Create new topic
        const maxOrdem = Math.max(...(collection?.topics.map(t => t.ordem) || [0]));
        const { error } = await supabase
          .from('exercise_topics')
          .insert([{
            collection_id: collectionId,
            assunto: topicForm.assunto,
            ordem: maxOrdem + 1
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: editingTopic ? "Tópico atualizado" : "Tópico criado",
      });

      setIsTopicDialogOpen(false);
      setEditingTopic(null);
      setTopicForm({ assunto: '' });
      loadCollection();
    } catch (error) {
      console.error('Error saving topic:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o tópico",
        variant: "destructive"
      });
    }
  };

  const handleSaveExercise = async () => {
    try {
      if (editingExercise) {
        // Update existing exercise
        const { error } = await supabase
          .from('topic_exercises')
          .update({
            enunciado: exerciseForm.enunciado,
            alternativas: exerciseForm.alternativas,
            resposta_correta: exerciseForm.resposta_correta,
            explicacao: exerciseForm.explicacao
          })
          .eq('id', editingExercise.id);

        if (error) throw error;
      } else {
        // Create new exercise - use selected topic
        const selectedTopic = collection?.topics.find(t => t.id === selectedTopicId);
        if (!selectedTopic) {
          toast({
            title: "Erro",
            description: "Crie um tópico primeiro",
            variant: "destructive"
          });
          return;
        }

        const maxOrdem = Math.max(...(selectedTopic.exercises.map(e => e.ordem) || [0]));
        const { error } = await supabase
          .from('topic_exercises')
          .insert([{
            topic_id: selectedTopic.id,
            enunciado: exerciseForm.enunciado,
            alternativas: exerciseForm.alternativas,
            resposta_correta: exerciseForm.resposta_correta,
            explicacao: exerciseForm.explicacao,
            ordem: maxOrdem + 1
          }]);

        if (error) throw error;
      }

      toast({
        title: "Sucesso!",
        description: editingExercise ? "Exercício atualizado" : "Exercício criado",
      });

      setIsExerciseDialogOpen(false);
      setEditingExercise(null);
      resetExerciseForm();
      loadCollection();
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o exercício",
        variant: "destructive"
      });
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (!confirm('Tem certeza? Isso excluirá o tópico e todos os exercícios dele.')) return;

    try {
      const { error } = await supabase
        .from('exercise_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Tópico excluído",
      });

      loadCollection();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tópico",
        variant: "destructive"
      });
    }
  };

  const deleteExercise = async (exerciseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      const { error } = await supabase
        .from('topic_exercises')
        .delete()
        .eq('id', exerciseId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Exercício excluído",
      });

      loadCollection();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o exercício",
        variant: "destructive"
      });
    }
  };

  const openTopicDialog = (topic?: Topic) => {
    if (topic) {
      setEditingTopic(topic);
      setTopicForm({ assunto: topic.assunto });
    } else {
      setEditingTopic(null);
      setTopicForm({ assunto: '' });
    }
    setIsTopicDialogOpen(true);
  };

  const openExerciseDialog = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseForm({
        enunciado: exercise.enunciado,
        alternativas: exercise.alternativas,
        resposta_correta: exercise.resposta_correta,
        explicacao: exercise.explicacao || ''
      });
    } else {
      setEditingExercise(null);
      resetExerciseForm();
    }
    setIsExerciseDialogOpen(true);
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      enunciado: '',
      alternativas: [
        { letra: 'A', texto: '' },
        { letra: 'B', texto: '' },
        { letra: 'C', texto: '' },
        { letra: 'D', texto: '' }
      ],
      resposta_correta: '',
      explicacao: ''
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Carregando...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Coleção não encontrada</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Badge variant="secondary">
          {collection.topics.length} tópicos
        </Badge>
      </div>

      {/* Collection Info */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Coleção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="materia">Matéria</Label>
              <Input
                id="materia"
                value={collection.materia}
                onChange={(e) => setCollection(prev => prev ? { ...prev, materia: e.target.value } : null)}
                onBlur={() => updateCollection(collection.materia, collection.serie_escolar)}
              />
            </div>
            <div>
              <Label htmlFor="serie">Série Escolar</Label>
              <Input
                id="serie"
                value={collection.serie_escolar}
                onChange={(e) => setCollection(prev => prev ? { ...prev, serie_escolar: e.target.value } : null)}
                onBlur={() => updateCollection(collection.materia, collection.serie_escolar)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tópicos e Exercícios</CardTitle>
            <Button onClick={() => openTopicDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Tópico
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {collection.topics.length > 0 ? (
            <div className="space-y-6">
              {/* Topic Selector */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="topic-select">Selecionar Tópico</Label>
                  <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                    <SelectTrigger className="w-full bg-background border-border z-50">
                      <SelectValue placeholder="Selecione um tópico" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border shadow-lg z-50">
                      {collection.topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id} className="hover:bg-muted">
                          {topic.assunto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Topic Content */}
              {selectedTopicId && (() => {
                const selectedTopic = collection.topics.find(t => t.id === selectedTopicId);
                if (!selectedTopic) return null;

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{selectedTopic.assunto}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTopic.exercises.length} exercícios</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openTopicDialog(selectedTopic)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteTopic(selectedTopic.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" onClick={() => openExerciseDialog()}>
                          <Plus className="w-4 h-4 mr-2" />
                          Novo Exercício
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedTopic.exercises.map((exercise, index) => (
                        <Card key={exercise.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">Questão {index + 1}</h4>
                                <p className="text-sm mb-2">{exercise.enunciado}</p>
                                <div className="text-xs text-muted-foreground">
                                  Resposta correta: {exercise.resposta_correta}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openExerciseDialog(exercise)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => deleteExercise(exercise.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum tópico encontrado</p>
              <p className="text-muted-foreground/60 text-sm">Crie um tópico primeiro para adicionar exercícios</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Topic Dialog */}
      <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTopic ? 'Editar Tópico' : 'Novo Tópico'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic-assunto">Nome do Tópico</Label>
              <Input
                id="topic-assunto"
                value={topicForm.assunto}
                onChange={(e) => setTopicForm(prev => ({ ...prev, assunto: e.target.value }))}
                placeholder="Ex: Álgebra Básica"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTopic}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Dialog */}
      <Dialog open={isExerciseDialogOpen} onOpenChange={setIsExerciseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExercise ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="exercise-enunciado">Enunciado</Label>
              <Textarea
                id="exercise-enunciado"
                value={exerciseForm.enunciado}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, enunciado: e.target.value }))}
                placeholder="Digite o enunciado da questão..."
              />
            </div>

            <div className="space-y-2">
              <Label>Alternativas</Label>
              {exerciseForm.alternativas.map((alt, index) => (
                <div key={alt.letra} className="flex gap-2 items-center">
                  <span className="font-medium">{alt.letra})</span>
                  <Input
                    value={alt.texto}
                    onChange={(e) => {
                      const newAlternativas = [...exerciseForm.alternativas];
                      newAlternativas[index].texto = e.target.value;
                      setExerciseForm(prev => ({ ...prev, alternativas: newAlternativas }));
                    }}
                    placeholder={`Alternativa ${alt.letra}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="resposta-correta">Resposta Correta</Label>
              <Input
                id="resposta-correta"
                value={exerciseForm.resposta_correta}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, resposta_correta: e.target.value }))}
                placeholder="A, B, C ou D"
                maxLength={1}
              />
            </div>

            <div>
              <Label htmlFor="explicacao">Explicação (opcional)</Label>
              <Textarea
                id="explicacao"
                value={exerciseForm.explicacao}
                onChange={(e) => setExerciseForm(prev => ({ ...prev, explicacao: e.target.value }))}
                placeholder="Explicação da resposta..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsExerciseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveExercise}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}