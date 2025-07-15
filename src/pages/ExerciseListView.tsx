import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ExerciseListView() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exerciseList, setExerciseList] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (listId) {
      loadExerciseList();
    }
  }, [listId]);

  const loadExerciseList = async () => {
    try {
      setLoading(true);

      // Carregar dados da lista
      const { data: listData, error: listError } = await supabase
        .from('exercise_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;

      setExerciseList(listData);

      // Carregar exercícios da lista
      if (listData.exercise_ids && listData.exercise_ids.length > 0) {
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('*')
          .in('id', listData.exercise_ids);

        if (exercisesError) throw exercisesError;
        setExercises(exercisesData || []);
      }
    } catch (error: any) {
      console.error('Erro ao carregar lista:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de exercícios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'fácil':
      case 'facil':
      case 'easy': 
        return 'bg-green-100 text-green-700';
      case 'médio':
      case 'medio':
      case 'medium': 
        return 'bg-yellow-100 text-yellow-700';
      case 'difícil':
      case 'dificil':
      case 'hard': 
        return 'bg-red-100 text-red-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!exerciseList) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Lista não encontrada.</p>
        <Button onClick={() => navigate('/exercicios')} className="mt-4">
          Voltar às Listas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/exercicios')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Listas
        </Button>
        
        <Badge className={getDifficultyColor(exerciseList.difficulty)}>
          {exerciseList.difficulty || 'Médio'}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{exerciseList.title}</h1>
        <p className="text-muted-foreground">{exerciseList.description}</p>
      </div>

      {/* Exercise Cards */}
      {exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <Card 
              key={exercise.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/exercicio/${exercise.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {exercise.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{exerciseList.subject}</p>
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty || 'Médio'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {exercise.question}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Exercício Disponível</h3>
            <p className="text-muted-foreground">
              Esta lista ainda não possui exercícios cadastrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}