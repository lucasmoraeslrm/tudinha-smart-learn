import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Clock, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ExerciciosPage() {
  const [exerciseLists, setExerciseLists] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar listas de exercícios
      const { data: listsData, error: listsError } = await supabase
        .from('exercise_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      // Carregar exercícios individuais
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (exercisesError) throw exercisesError;

      setExerciseLists(listsData || []);
      setExercises(exercisesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios.",
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

  const totalExercises = exercises.length + exerciseLists.reduce((acc, list) => acc + (list.exercise_ids?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exercícios</h1>
          <p className="text-muted-foreground">Pratique e teste seus conhecimentos</p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Criar Lista Personalizada
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{totalExercises}</p>
                <p className="text-sm text-muted-foreground">Exercícios Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">0h 0m</p>
                <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Lists */}
      {exerciseLists.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Listas de Exercícios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exerciseLists.map((list) => (
              <Card key={list.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{list.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                    </div>
                    <Badge variant="secondary" className={getDifficultyColor(list.difficulty)}>
                      {list.difficulty || 'Médio'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span>0/{list.exercise_ids?.length || 0} exercícios</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{list.subject}</Badge>
                      <span className="text-sm text-muted-foreground">{list.exercise_ids?.length || 0} exercícios</span>
                    </div>

                    <Button className="w-full">
                      Iniciar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Individual Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Exercícios Individuais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exercise.question}</p>
                    </div>
                    <Badge variant="secondary" className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty || 'Médio'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{exercise.subject}</Badge>
                      <span className="text-sm text-muted-foreground">1 exercício</span>
                    </div>

                    <Button className="w-full">
                      Resolver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {exerciseLists.length === 0 && exercises.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Exercício Disponível</h3>
            <p className="text-muted-foreground">
              Os exercícios serão adicionados pelos professores. Aguarde novas atividades!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}