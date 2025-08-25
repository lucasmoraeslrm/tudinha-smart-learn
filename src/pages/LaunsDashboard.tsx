import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolManager from '@/components/SchoolManager';
import SchoolUsersView from '@/components/SchoolUsersView';
import { School, useSchools } from '@/hooks/useSchools';
import { 
  Code2, 
  Users, 
  BookOpen, 
  MessageCircle, 
  Settings, 
  LogOut,
  Activity,
  Database,
  Shield,
  School as SchoolIcon,
  Puzzle,
  BarChart3
} from 'lucide-react';

export default function LaunsDashboard() {
  const { signOut, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { schools, modules, loading } = useSchools();

  const handleLogout = async () => {
    await signOut();
    navigate('/launs');
  };

  const stats = [
    { title: 'Escolas Ativas', value: schools.filter(s => s.ativa).length.toString(), icon: SchoolIcon, color: 'text-blue-600' },
    { title: 'Total de Escolas', value: schools.length.toString(), icon: Users, color: 'text-green-600' },
    { title: 'Módulos Disponíveis', value: modules.length.toString(), icon: Puzzle, color: 'text-purple-600' },
    { title: 'Uptime Sistema', value: '99.9%', icon: Activity, color: 'text-emerald-600' },
  ];

  const quickActions = [
    { title: 'Analytics Global', description: 'Métricas de todas as escolas', icon: BarChart3, action: () => {} },
    { title: 'Database Admin', description: 'Administrar banco de dados', icon: Database, action: () => {} },
    { title: 'Logs do Sistema', description: 'Monitorar atividades', icon: Activity, action: () => {} },
    { title: 'Segurança', description: 'Políticas e permissões', icon: Shield, action: () => {} },
  ];

  if (selectedSchool) {
    return (
      <div className="min-h-screen bg-gradient-main">
        <div className="container mx-auto p-6">
          <SchoolUsersView 
            school={selectedSchool} 
            onBack={() => setSelectedSchool(null)} 
          />
        </div>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Carregando painel...</p>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
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
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main SAAS Dashboard */}
        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="schools" className="text-white data-[state=active]:bg-white/20">
              <SchoolIcon className="w-4 h-4 mr-2" />
              Escolas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-white/20">
              <Settings className="w-4 h-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            <SchoolManager onViewUsers={setSelectedSchool} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card key={index} className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6" />
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                      </div>
                      <CardDescription className="text-white/70">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            {/* System Status */}
            <Card className="bg-white/10 border-white/20 text-white">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}