import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Trophy, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAlunoSerie } from '@/lib/student-utils';

export default function ExerciciosPage() {
  const [exerciseCollections, setExerciseCollections] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalExercises: 0, completedSessions: 0, studyTimeMinutes: 0 });
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

      // Obter série do aluno
      let serieDoAluno: string | null = null;
      if (studentId) {
        serieDoAluno = await getAlunoSerie(studentId);
      }

      // Carregar coleções de exercícios filtradas por série
      let collectionsQuery = supabase
        .from('exercise_collections')
        .select(`
          *,
          exercise_topics (
            id,
            assunto,
            topic_exercises (id)
          )
        `);

      // Filtrar por série se disponível
      if (serieDoAluno) {
        collectionsQuery = collectionsQuery.eq('serie_escolar', serieDoAluno);
      }

      const { data: collectionsData, error: collectionsError } = await collectionsQuery
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;

      // Calcular estatísticas dos exercícios
      let totalExercises = 0;
      collectionsData?.forEach(collection => {
        collection.exercise_topics?.forEach((topic: any) => {
          totalExercises += topic.topic_exercises?.length || 0;
        });
      });

      // Carregar estatísticas do estudante
      let completedSessions = 0;
      let studyTimeMinutes = 0;
      
      if (studentId) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('student_exercise_sessions')
          .select('*')
          .eq('student_id', studentId)
          .not('finished_at', 'is', null);

        if (!sessionsError && sessionsData) {
          completedSessions = sessionsData.length;
          
          // Calcular tempo de estudo total
          studyTimeMinutes = sessionsData.reduce((total, session) => {
            return total + Math.floor((session.total_time_seconds || 0) / 60);
          }, 0);
        }
      }

      setStats({
        totalExercises,
        completedSessions,
        studyTimeMinutes
      });

      setExerciseCollections(collectionsData || []);
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
                <p className="text-lg font-semibold">{stats.completedSessions}</p>
                <p className="text-sm text-muted-foreground">Sessões Concluídas</p>
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

      {/* Exercise Collections */}
      {exerciseCollections.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Coleções de Exercícios</h2>
          <p className="text-muted-foreground">Escolha uma coleção para começar a praticar</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exerciseCollections.map((collection) => {
              const totalTopics = collection.exercise_topics?.length || 0;
              const totalExercises = collection.exercise_topics?.reduce((acc: number, topic: any) => 
                acc + (topic.topic_exercises?.length || 0), 0) || 0;

              return (
                <Card 
                  key={collection.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/colecao/${collection.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {collection.materia}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{collection.serie_escolar}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{totalTopics} tópicos</span>
                        <span className="text-muted-foreground">{totalExercises} exercícios</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
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