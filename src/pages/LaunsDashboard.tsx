import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SchoolManager from '@/components/SchoolManager';
import SchoolUsersView from '@/components/SchoolUsersView';
import { LaunsLayout } from '@/components/LaunsLayout';
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
  BarChart3,
  ArrowLeft
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
    { title: 'Escolas Ativas', value: schools.filter(s => s.ativa).length.toString(), icon: SchoolIcon, color: 'text-primary' },
    { title: 'Total de Escolas', value: schools.length.toString(), icon: Users, color: 'text-primary' },
    { title: 'Módulos Disponíveis', value: modules.length.toString(), icon: Puzzle, color: 'text-primary' },
    { title: 'Uptime Sistema', value: '99.9%', icon: Activity, color: 'text-success' },
  ];

  const quickActions = [
    { title: 'Analytics Global', description: 'Métricas de todas as escolas', icon: BarChart3, action: () => {} },
    { title: 'Database Admin', description: 'Administrar banco de dados', icon: Database, action: () => {} },
    { title: 'Logs do Sistema', description: 'Monitorar atividades', icon: Activity, action: () => {} },
    { title: 'Segurança', description: 'Políticas e permissões', icon: Shield, action: () => {} },
  ];

  if (selectedSchool) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSchool(null)}
              className="text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          <SchoolUsersView 
            schoolId={selectedSchool.id} 
          />
        </div>
      </LaunsLayout>
    );
  }

  if (loading || authLoading) {
    return (
      <LaunsLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando painel...</p>
          </div>
        </div>
      </LaunsLayout>
    );
  }

  return (
    <LaunsLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Painel do Desenvolvedor
            </h1>
            <p className="text-muted-foreground">
              Bem-vindo, {profile?.full_name || 'Desenvolvedor Launs'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-secondary border border-border text-foreground/80">
              <Code2 className="w-4 h-4 mr-2" />
              Dev Mode
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="border shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
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

        {/* Main Content */}
        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="schools" className="text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <SchoolIcon className="w-4 h-4 mr-2" />
              Escolas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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
                  <Card key={index} className="border shadow-soft hover:bg-muted transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg text-foreground">{action.title}</CardTitle>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="border shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">API Status</span>
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">Database</span>
                    <Badge className="bg-success text-success-foreground hover:bg-success/90">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-foreground">Storage</span>
                    <Badge className="bg-accent text-accent-foreground">Warning</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LaunsLayout>
  );
}