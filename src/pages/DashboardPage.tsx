import React from 'react';
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
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { studentSession } = useAuth();
  const navigate = useNavigate();

  const studentName = studentSession?.name || studentSession?.full_name || 'Estudante';

  const stats = [
    {
      icon: MessageCircle,
      value: '9',
      label: 'Mensagens',
      color: 'bg-purple-100 text-purple-600',
      iconBg: 'bg-purple-600'
    },
    {
      icon: Target,
      value: '0',
      label: 'Exercícios',
      color: 'bg-green-100 text-green-600',
      iconBg: 'bg-green-600'
    },
    {
      icon: TrendingUp,
      value: '0%',
      label: 'Acertos',
      color: 'bg-yellow-100 text-yellow-600',
      iconBg: 'bg-yellow-600'
    },
    {
      icon: BookOpen,
      value: '0',
      label: 'Listas',
      color: 'bg-purple-100 text-purple-600',
      iconBg: 'bg-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                  <span>Meta: 10 exercícios</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                Continue assim! Você está indo muito bem esta semana 🎉
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
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Complete alguns exercícios para ver suas matérias favoritas aqui
              </p>
            </div>
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
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Completar 10 exercícios</p>
                  <p className="text-sm text-muted-foreground">Geral</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">0%</span>
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