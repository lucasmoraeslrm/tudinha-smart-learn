import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
}

export default function CreateExerciseList() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, title, subject, difficulty')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExercises(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar exercícios",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleExerciseToggle = (exerciseId: string, checked: boolean) => {
    if (checked) {
      setSelectedExercises([...selectedExercises, exerciseId]);
    } else {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedExercises.length === 0) {
        throw new Error('Selecione pelo menos um exercício');
      }

      const { error } = await supabase
        .from('exercise_lists')
        .insert([{
          title,
          subject,
          description: description || null,
          difficulty,
          exercise_ids: selectedExercises
        }]);

      if (error) throw error;

      toast({
        title: "Lista criada!",
        description: "A lista de exercícios foi criada com sucesso.",
      });

      // Reset form
      setTitle('');
      setSubject('');
      setDescription('');
      setDifficulty('medium');
      setSelectedExercises([]);
    } catch (error: any) {
      toast({
        title: "Erro ao criar lista",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(exercise => 
    !subject || exercise.subject.toLowerCase().includes(subject.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Lista de Exercícios</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Lista</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da lista"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Matemática, Português..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da lista de exercícios"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Exercícios ({selectedExercises.length} selecionados)</Label>
            {loadingExercises ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {filteredExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum exercício encontrado. Crie exercícios primeiro.
                  </p>
                ) : (
                  filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={exercise.id}
                        checked={selectedExercises.includes(exercise.id)}
                        onCheckedChange={(checked) => 
                          handleExerciseToggle(exercise.id, !!checked)
                        }
                      />
                      <label
                        htmlFor={exercise.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                      >
                        <div>
                          <span className="font-semibold">{exercise.title}</span>
                          <div className="text-xs text-muted-foreground">
                            {exercise.subject} • {exercise.difficulty}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading || selectedExercises.length === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Lista'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}