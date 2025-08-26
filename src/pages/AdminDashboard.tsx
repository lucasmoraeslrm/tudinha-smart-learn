import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BookOpen, 
  List, 
  MessageCircle,
  TrendingUp,
  Activity,
  CheckCircle,
  MessageSquare,
  BookCheck,
  School,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEscola } from '@/hooks/useEscola';

export default function AdminDashboard() {
  const { escola, isSchoolUser, hasEscola } = useEscola();
  const [stats, setStats] = useState({
    students: 0,
    exercises: 0,
    exerciseLists: 0,
    messages: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [performance, setPerformance] = useState({
    completionRate: 0,
    chatEngagement: 0,
    averageStudyTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData(escola?.id);
  }, [escola?.id]);

  const fetchDashboardData = async (escolaId?: string) => {
    try {
      // Fetch basic stats (filter by escola when available)
      const studentsQuery = supabase.from('students').select('id', { count: 'exact' });
      if (escolaId) studentsQuery.eq('escola_id', escolaId);
      const studentsRes = await studentsQuery;

      // Get student IDs for message filtering
      let studentIds: string[] = [];
      if (escolaId) {
        const { data: studentsData } = await supabase
          .from('students')
          .select('id')
          .eq('escola_id', escolaId);
        studentIds = studentsData?.map(s => s.id) || [];
      }

      // Fetch messages count (filtered by school students)
      let messagesQuery = supabase.from('messages').select('id', { count: 'exact' });
      if (escolaId && studentIds.length > 0) {
        messagesQuery = messagesQuery.in('user_id', studentIds);
      }
      const messagesRes = await messagesQuery;

      const [exercisesRes, listsRes] = await Promise.all([
        supabase.from('exercises').select('id', { count: 'exact' }),
        supabase.from('exercise_lists').select('id', { count: 'exact' })
      ]);

      setStats({
        students: studentsRes.count || 0,
        exercises: exercisesRes.count || 0,
        exerciseLists: listsRes.count || 0,
        messages: messagesRes.count || 0
      });

      // Fetch recent activity (filter by escola via students join)
      const answersQuery = supabase
        .from('student_answers')
        .select(`
          answered_at,
          is_correct,
          students!inner(name, escola_id),
          exercises!inner(title, subject)
        `)
        .order('answered_at', { ascending: false })
        .limit(5);
      if (escolaId) answersQuery.eq('students.escola_id', escolaId);

      // Fetch chat messages (filtered by school students)
      let chatQuery = supabase
        .from('messages')
        .select('created_at, user_id')
        .eq('sender', 'user')
        .order('created_at', { ascending: false })
        .limit(5);
      if (escolaId && studentIds.length > 0) {
        chatQuery = chatQuery.in('user_id', studentIds);
      }

      const completedListsQuery = supabase
        .from('student_answers')
        .select(`
          answered_at,
          students!inner(name, escola_id),
          exercise_lists!inner(title)
        `)
        .not('list_id', 'is', null)
        .order('answered_at', { ascending: false })
        .limit(3);
      if (escolaId) completedListsQuery.eq('students.escola_id', escolaId);

      const [answersRes, chatRes, completedListsRes] = await Promise.all([
        answersQuery,
        chatQuery,
        completedListsQuery
      ]);

      // Process recent activity
      const activities: any[] = [];
      
      // Add recent answers
      answersRes.data?.forEach((answer: any) => {
        activities.push({
          type: 'answer',
          student: answer.students?.name || 'Aluno',
          action: `respondeu exercício de ${answer.exercises?.subject || 'matéria'}`,
          time: answer.answered_at,
          success: answer.is_correct
        });
      });

      // Add chat activity
      chatRes.data?.forEach((chat: any) => {
        activities.push({
          type: 'chat',
          student: 'Aluno',
          action: 'iniciou chat com Tudinha',
          time: chat.created_at,
          success: true
        });
      });

      // Add completed lists
      completedListsRes.data?.forEach((completion: any) => {
        activities.push({
          type: 'completion',
          student: completion.students?.name || 'Aluno',
          action: `completou ${completion.exercise_lists?.title || 'lista de exercícios'}`,
          time: completion.answered_at,
          success: true
        });
      });

      // Sort activities by time and take top 3
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 3));

      // Calculate performance metrics (filtered by school)
      let totalAnswersQuery = supabase
        .from('student_answers')
        .select('is_correct', { count: 'exact' });
      let correctAnswersQuery = supabase
        .from('student_answers')
        .select('id', { count: 'exact' })
        .eq('is_correct', true);
      let uniqueStudentsQuery = supabase
        .from('messages')
        .select('user_id')
        .eq('sender', 'user');

      if (escolaId && studentIds.length > 0) {
        totalAnswersQuery = totalAnswersQuery.in('student_id', studentIds);
        correctAnswersQuery = correctAnswersQuery.in('student_id', studentIds);
        uniqueStudentsQuery = uniqueStudentsQuery.in('user_id', studentIds);
      }

      const [totalAnswers, correctAnswers, uniqueStudentsWithMessages] = await Promise.all([
        totalAnswersQuery,
        correctAnswersQuery,
        uniqueStudentsQuery
      ]);

      const completionRate = totalAnswers.count && totalAnswers.count > 0 
        ? Math.round((correctAnswers.count || 0) / totalAnswers.count * 100)
        : 0;

      const uniqueUsers = new Set(uniqueStudentsWithMessages.data?.map(m => m.user_id)).size;
      const chatEngagement = stats.students > 0 ? Math.round((uniqueUsers / stats.students) * 100) : 0;

      setPerformance({
        completionRate,
        chatEngagement,
        averageStudyTime: 45 // This would need more complex calculation
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <BookCheck className="w-4 h-4" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4" />;
      case 'completion':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string, success?: boolean) => {
    if (type === 'answer') return success ? 'bg-green-500' : 'bg-red-500';
    if (type === 'chat') return 'bg-blue-500';
    if (type === 'completion') return 'bg-green-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* School Info Header - Only for school users */}
      {isSchoolUser && hasEscola && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {escola?.logo_url ? (
                  <img 
                    src={escola.logo_url} 
                    alt={escola.nome} 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <School className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold">{escola?.nome_fantasia || escola?.nome}</h2>
                <p className="text-sm text-muted-foreground">{escola?.razao_social}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {escola?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{escola.email}</span>
                </div>
              )}
              {escola?.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{escola.telefone}</span>
                </div>
              )}
              {escola?.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{escola.endereco}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          {isSchoolUser ? `Visão geral da ${escola?.nome || 'escola'}` : 'Visão geral do sistema educacional'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{stats.students}</p>
                <p className="text-sm text-muted-foreground">Alunos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{stats.exercises}</p>
                <p className="text-sm text-muted-foreground">Exercícios Criados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <List className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{stats.exerciseLists}</p>
                <p className="text-sm text-muted-foreground">Listas de Exercícios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">{stats.messages}</p>
                <p className="text-sm text-muted-foreground">Mensagens Chat</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.student} {activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.time), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type, activity.success)}`}></div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Desempenho Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Taxa de Acerto</span>
                  <span className="text-sm text-muted-foreground">{performance.completionRate}%</span>
                </div>
                <Progress value={performance.completionRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Engajamento no Chat</span>
                  <span className="text-sm text-muted-foreground">{performance.chatEngagement}%</span>
                </div>
                <Progress value={performance.chatEngagement} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tempo Médio de Estudo</span>
                  <span className="text-sm text-muted-foreground">{performance.averageStudyTime}min</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}