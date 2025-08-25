import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  LogOut,
  Award,
  Clock,
  Target
} from 'lucide-react';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [parentData, setParentData] = useState<any>(null);

  useEffect(() => {
    const session = localStorage.getItem('parentSession');
    if (session) {
      setParentData(JSON.parse(session));
    } else {
      navigate('/pais');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('parentSession');
    navigate('/pais');
  };

  if (!parentData) return null;

  const studentStats = [
    { title: 'Exercícios Concluídos', value: '247', icon: BookOpen, color: 'text-green-600' },
    { title: 'Média Geral', value: '8.5', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'Horas Estudadas', value: '127h', icon: Clock, color: 'text-purple-600' },
    { title: 'Meta do Mês', value: '92%', icon: Target, color: 'text-orange-600' },
  ];

  const recentActivities = [
    { subject: 'Matemática', activity: 'Completou lista de exercícios', time: '2 horas atrás', score: '9.2' },
    { subject: 'Português', activity: 'Participou do chat educativo', time: '1 dia atrás', score: '-' },
    { subject: 'Ciências', activity: 'Finalizou jornada de aprendizado', time: '2 dias atrás', score: '8.7' },
  ];

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Painel dos Pais
            </h1>
            <p className="text-white/80">
              Acompanhe o desenvolvimento de seu filho
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              <Users className="w-4 h-4 mr-2" />
              Responsável
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Student Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studentStats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{activity.subject}</p>
                      <p className="text-sm text-white/70">{activity.activity}</p>
                      <p className="text-xs text-white/60">{activity.time}</p>
                    </div>
                    {activity.score !== '-' && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        {activity.score}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Conquistas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    🏆
                  </div>
                  <div>
                    <p className="font-medium">Matemático do Mês</p>
                    <p className="text-sm text-white/70">Completou 50 exercícios</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    📚
                  </div>
                  <div>
                    <p className="font-medium">Leitor Dedicado</p>
                    <p className="text-sm text-white/70">10 horas de leitura</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    ⭐
                  </div>
                  <div>
                    <p className="font-medium">Sequência Perfeita</p>
                    <p className="text-sm text-white/70">7 dias consecutivos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Relatório Mensal</CardTitle>
              <CardDescription className="text-white/70">
                Baixar relatório detalhado
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Conversar com Professor</CardTitle>
              <CardDescription className="text-white/70">
                Agendar uma reunião
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
              <CardDescription className="text-white/70">
                Notificações e preferências
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}