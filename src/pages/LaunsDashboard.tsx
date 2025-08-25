import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code2, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  LogOut,
  Activity,
  Database,
  Shield
} from 'lucide-react';

export default function LaunsDashboard() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/launs');
  };

  const stats = [
    { title: 'Usuários Ativos', value: '2,847', icon: Users, color: 'text-blue-600' },
    { title: 'Exercícios', value: '1,234', icon: BookOpen, color: 'text-green-600' },
    { title: 'Mensagens Chat', value: '15,692', icon: MessageCircle, color: 'text-purple-600' },
    { title: 'Uptime', value: '99.9%', icon: Activity, color: 'text-emerald-600' },
  ];

  const quickActions = [
    { title: 'Gerenciar Sistema', description: 'Configurações globais', icon: Settings, href: '/launs/settings' },
    { title: 'Database Admin', description: 'Administrar banco de dados', icon: Database, href: '/launs/database' },
    { title: 'Logs do Sistema', description: 'Monitorar atividades', icon: Activity, href: '/launs/logs' },
    { title: 'Segurança', description: 'Políticas e permissões', icon: Shield, href: '/launs/security' },
  ];

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Painel do Desenvolvedor
            </h1>
            <p className="text-white/80">
              Bem-vindo, {profile?.full_name || 'Desenvolvedor Launs'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
              <Code2 className="w-4 h-4 mr-2" />
              Dev Mode
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <action.icon className="h-6 w-6" />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription className="text-white/70">
                  {action.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <Card className="mt-8 bg-white/10 border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>API Status</span>
                <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>Database</span>
                <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>Storage</span>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}