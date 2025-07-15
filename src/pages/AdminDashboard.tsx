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
  BookCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const [studentsRes, exercisesRes, listsRes, messagesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('exercises').select('id', { count: 'exact' }),
        supabase.from('exercise_lists').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' })
      ]);

      setStats({
        students: studentsRes.count || 0,
        exercises: exercisesRes.count || 0,
        exerciseLists: listsRes.count || 0,
        messages: messagesRes.count || 0
      });

      // Fetch recent activity
      const [answersRes, chatRes, completedListsRes] = await Promise.all([
        supabase
          .from('student_answers')
          .select(`
            answered_at,
            is_correct,
            students!inner(name),
            exercises!inner(title, subject)
          `)
          .order('answered_at', { ascending: false })
          .limit(5),
        supabase
          .from('messages')
          .select('created_at, user_id')
          .eq('sender', 'user')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('student_answers')
          .select(`
            answered_at,
            students!inner(name),
            exercise_lists!inner(title)
          `)
          .not('list_id', 'is', null)
          .order('answered_at', { ascending: false })
          .limit(3)
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

      // Calculate performance metrics
      const totalAnswers = await supabase
        .from('student_answers')
        .select('is_correct', { count: 'exact' });
      
      const correctAnswers = await supabase
        .from('student_answers')
        .select('id', { count: 'exact' })
        .eq('is_correct', true);

      const completionRate = totalAnswers.count && totalAnswers.count > 0 
        ? Math.round((correctAnswers.count || 0) / totalAnswers.count * 100)
        : 0;

      const uniqueStudentsWithMessages = await supabase
        .from('messages')
        .select('user_id')
        .eq('sender', 'user');

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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do sistema educacional</p>
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