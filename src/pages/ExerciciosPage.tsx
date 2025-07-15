import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Trophy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ExerciciosPage() {
  const [exerciseLists, setExerciseLists] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalExercises: 0, completedExercises: 0, studyTimeMinutes: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getStudentId } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();

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

      // Carregar estatísticas do estudante
      if (studentId) {
        const { data: answersData, error: answersError } = await supabase
          .from('student_answers')
          .select('*')
          .eq('student_id', studentId);

        if (!answersError && answersData) {
          const completedExercises = answersData.length;
          
          // Calcular tempo de estudo (assumindo 2 minutos por exercício respondido)
          const studyTimeMinutes = completedExercises * 2;

          setStats({
            totalExercises: (exercisesData?.length || 0) + (listsData?.reduce((acc, list) => acc + (list.exercise_ids?.length || 0), 0) || 0),
            completedExercises,
            studyTimeMinutes
          });
        }
      }

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
      <div>
        <h1 className="text-2xl font-bold">Exercícios</h1>
        <p className="text-muted-foreground">Pratique e teste seus conhecimentos</p>
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
                <p className="text-lg font-semibold">{stats.totalExercises}</p>
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
                <p className="text-lg font-semibold">{stats.completedExercises}</p>
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
                <p className="text-lg font-semibold">
                  {Math.floor(stats.studyTimeMinutes / 60)}h {stats.studyTimeMinutes % 60}m
                </p>
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
          <p className="text-muted-foreground">Escolha uma lista para começar a praticar</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exerciseLists.map((list) => (
              <Card 
                key={list.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/lista/${list.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {list.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{list.subject}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getDifficultyColor(list.difficulty)}>
                      {list.difficulty || 'Médio'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {list.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{list.exercise_ids?.length || 0} exercícios</span>
                    </div>
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
              <Card 
                key={exercise.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/exercicio/${exercise.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {exercise.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{exercise.subject}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getDifficultyColor(exercise.difficulty)}>
                      {exercise.difficulty || 'Médio'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exercise.question}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">1 exercício</span>
                    </div>
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