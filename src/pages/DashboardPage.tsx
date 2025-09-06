import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Target, 
  TrendingUp, 
  BookOpen,
  Calendar,
  Trophy,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getAlunoSerie } from '@/lib/student-utils';

export default function DashboardPage() {
  const { studentSession, getStudentId, getStudentName } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    messages: 0,
    exercises: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    lists: 0
  });
  
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    goal: 10
  });
  
  const [favoriteSubjects, setFavoriteSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const studentName = studentSession?.name || studentSession?.full_name || getStudentName() || 'Estudante';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const studentId = getStudentId();
      
      if (!studentId) {
        console.log('Student ID not found');
        setLoading(false);
        return;
      }

      await Promise.all([
        loadMessages(studentId),
        loadExerciseStats(studentId),
        loadLists(),
        loadWeeklyProgress(studentId),
        loadFavoriteSubjects(studentId)
      ]);

    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (studentId: string) => {
    try {
      // Buscar mensagens do chat usando student ID ou name
      const studentName = getStudentName();
      const userId = `user_${studentName?.toLowerCase().replace(/\s+/g, '_')}`;
      
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('user_id', userId)
        .eq('sender', 'user');

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return;
      }

      setStats(prev => ({ ...prev, messages: data?.length || 0 }));
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const loadExerciseStats = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_exercise_sessions')
        .select('total_questions, score')
        .eq('student_id', studentId)
        .not('finished_at', 'is', null);

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        return;
      }

      const totalAnswers = data?.reduce((acc, session) => acc + (session.total_questions || 0), 0) || 0;
      const correctAnswers = data?.reduce((acc, session) => acc + (session.score || 0), 0) || 0;

      setStats(prev => ({ 
        ...prev, 
        exercises: totalAnswers,
        correctAnswers,
        totalAnswers
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas de exercícios:', error);
    }
  };

  const loadLists = async () => {
    try {
      // Obter a série normalizada do aluno
      const serieDoAluno = await getAlunoSerie();
      
      if (!serieDoAluno) {
        setStats(prev => ({ ...prev, lists: 0 }));
        return;
      }
      
      // Contar coleções filtradas pela série do aluno (case-insensitive)
      const { count, error } = await supabase
        .from('exercise_collections')
        .select('*', { count: 'exact', head: true })
        .ilike('serie_escolar', serieDoAluno);

      if (error) {
        console.error('Erro ao buscar coleções:', error);
        return;
      }

      setStats(prev => ({ ...prev, lists: count || 0 }));
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
    }
  };

  const loadWeeklyProgress = async (studentId: string) => {
    try {
      // Calcular exercícios da semana atual
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('student_exercise_sessions')
        .select('total_questions')
        .eq('student_id', studentId)
        .not('finished_at', 'is', null)
        .gte('finished_at', oneWeekAgo.toISOString());

      if (error) {
        console.error('Erro ao buscar progresso semanal:', error);
        return;
      }

      const weeklyCompleted = data?.reduce((acc, session) => acc + (session.total_questions || 0), 0) || 0;

      setWeeklyProgress(prev => ({ 
        ...prev, 
        completed: weeklyCompleted
      }));
    } catch (error) {
      console.error('Erro ao carregar progresso semanal:', error);
    }
  };

  const loadFavoriteSubjects = async (studentId: string) => {
    try {
      // Buscar sessões do aluno com dados dos tópicos e coleções
      const { data, error } = await supabase
        .from('student_exercise_sessions')
        .select(`
          score,
          total_questions,
          exercise_topics!topic_id (
            collection_id,
            exercise_collections!collection_id (materia)
          )
        `)
        .eq('student_id', studentId)
        .not('finished_at', 'is', null);

      if (error) {
        console.error('Erro ao buscar matérias favoritas:', error);
        return;
      }

      // Agrupar por matéria e calcular estatísticas
      const subjectStats: { [key: string]: { total: number, correct: number } } = {};
      
      data?.forEach(session => {
        const materia = session.exercise_topics?.exercise_collections?.materia;
        if (materia) {
          if (!subjectStats[materia]) {
            subjectStats[materia] = { total: 0, correct: 0 };
          }
          subjectStats[materia].total += session.total_questions || 0;
          subjectStats[materia].correct += session.score || 0;
        }
      });

      // Ordenar por taxa de acerto
      const sortedSubjects = Object.entries(subjectStats)
        .filter(([, stats]) => stats.total > 0)
        .map(([subject, stats]) => ({
          subject,
          total: stats.total,
          correct: stats.correct,
          percentage: Math.round((stats.correct / stats.total) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);

      setFavoriteSubjects(sortedSubjects);
    } catch (error) {
      console.error('Erro ao carregar matérias favoritas:', error);
    }
  };

  const getAccuracyPercentage = () => {
    if (stats.totalAnswers === 0) return 0;
    return Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
  };

  const getWeeklyProgressPercentage = () => {
    return Math.min(Math.round((weeklyProgress.completed / weeklyProgress.goal) * 100), 100);
  };

  const getGoalPercentage = () => {
    return Math.min(Math.round((stats.exercises / 10) * 100), 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const displayStats = [
    {
      icon: MessageCircle,
      value: stats.messages.toString(),
      label: 'Mensagens',
      color: 'bg-purple-100 text-purple-600',
      iconBg: 'bg-purple-600'
    },
    {
      icon: Target,
      value: stats.exercises.toString(),
      label: 'Exercícios',
      color: 'bg-green-100 text-green-600',
      iconBg: 'bg-green-600'
    },
    {
      icon: TrendingUp,
      value: `${getAccuracyPercentage()}%`,
      label: 'Acertos',
      color: 'bg-yellow-100 text-yellow-600',
      iconBg: 'bg-yellow-600'
    },
      {
        icon: BookOpen,
        value: stats.lists.toString(),
        label: 'Coleções',
        color: 'bg-purple-100 text-purple-600',
        iconBg: 'bg-purple-600'
      }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/exercicios')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Exercícios</h3>
                <p className="text-sm text-muted-foreground">Pratique com exercícios interativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/chat')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Chat com Tudinha</h3>
                <p className="text-sm text-muted-foreground">Tire suas dúvidas em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Progresso Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Meta: {weeklyProgress.goal} exercícios</span>
                  <span>{getWeeklyProgressPercentage()}%</span>
                </div>
                <Progress value={getWeeklyProgressPercentage()} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {weeklyProgress.completed > 0 
                  ? `Você já fez ${weeklyProgress.completed} exercício${weeklyProgress.completed > 1 ? 's' : ''} esta semana! 🎉`
                  : 'Continue assim! Você está indo muito bem esta semana 🎉'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              Matérias Favoritas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteSubjects.length > 0 ? (
              <div className="space-y-3">
                {favoriteSubjects.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{subject.subject}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{subject.percentage}%</div>
                      <div className="text-xs text-muted-foreground">{subject.correct}/{subject.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Complete alguns exercícios para ver suas matérias favoritas aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Study Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Seus Objetivos de Estudo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 ${getGoalPercentage() === 100 ? 'text-green-600' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-medium">Completar 10 exercícios</p>
                  <p className="text-sm text-muted-foreground">Geral</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{getGoalPercentage()}%</span>
            </div>
            
            <Button variant="outline" className="w-full">
              Adicionar Novo Objetivo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}