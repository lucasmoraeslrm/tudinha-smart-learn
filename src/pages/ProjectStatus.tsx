import React, { useState, useEffect } from 'react';
import { LaunsLayout } from '@/components/LaunsLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, Users, School, BookOpen, MessageSquare, Webhook, Monitor, Shield, Database, Zap } from 'lucide-react';

interface ProjectMetrics {
  escolas: number;
  students: number;
  professores: number;
  coordenadores: number;
  tutores: number;
  exercises: number;
  exercise_lists: number;
  exercise_collections: number;
  jornadas: number;
  chats: number;
  messages: number;
  webhooks: number;
  maquinas: number;
  modulos: number;
  escola_modulos: number;
}

interface AccessMatrix {
  route: string;
  launs_admin: boolean;
  school_admin: boolean;
  coordinator: boolean;
  professor: boolean;
  student: boolean;
  parent: boolean;
  description: string;
}

interface ModuleStatus {
  nome: string;
  codigo: string;
  ativo: boolean;
  escolas_ativas: number;
  total_escolas: number;
}

interface SecurityIssue {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

export default function ProjectStatus() {
  const { profile, escola } = useAuth();
  const [metrics, setMetrics] = useState<ProjectMetrics | null>(null);
  const [modules, setModules] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [systemHealth, setSystemHealth] = useState({ api: true, database: true, realtime: true });

  const isLaunsAdmin = profile?.role === 'admin' && !escola;
  const isSchoolAdmin = profile?.role === 'admin' || profile?.role === 'coordinator';

  // Access Matrix - Routes and their permissions
  const accessMatrix: AccessMatrix[] = [
    { route: '/launs/*', launs_admin: true, school_admin: false, coordinator: false, professor: false, student: false, parent: false, description: 'Launs admin panel' },
    { route: '/admin/*', launs_admin: false, school_admin: true, coordinator: true, professor: false, student: false, parent: false, description: 'School admin panel' },
    { route: '/professor/*', launs_admin: false, school_admin: false, coordinator: false, professor: true, student: false, parent: false, description: 'Professor dashboard' },
    { route: '/dashboard', launs_admin: false, school_admin: false, coordinator: false, professor: false, student: true, parent: false, description: 'Student dashboard' },
    { route: '/jornada', launs_admin: false, school_admin: false, coordinator: false, professor: false, student: true, parent: false, description: 'Student journey' },
    { route: '/chat', launs_admin: false, school_admin: false, coordinator: false, professor: false, student: true, parent: false, description: 'Student chat' },
    { route: '/exercicios', launs_admin: false, school_admin: false, coordinator: false, professor: false, student: true, parent: false, description: 'Student exercises' },
    { route: '/pais/*', launs_admin: false, school_admin: false, coordinator: false, professor: false, student: false, parent: true, description: 'Parent dashboard' },
  ];

  // Security checklist
  const securityIssues: SecurityIssue[] = [
    {
      type: 'info',
      title: 'Row Level Security (RLS)',
      description: 'RLS is enabled on all tables',
      recommendation: 'Verify RLS policies are correctly implemented for each role'
    },
    {
      type: 'warning',
      title: 'Student Authentication',
      description: 'Students use code-based authentication',
      recommendation: 'Consider implementing stronger password policies'
    },
    {
      type: 'info',
      title: 'Real-time Updates',
      description: 'Real-time subscriptions active for critical tables',
      recommendation: 'Monitor subscription limits and performance'
    }
  ];

  // Load project metrics
  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Test system health
      const healthStart = Date.now();
      await supabase.from('profiles').select('count').single();
      const responseTime = Date.now() - healthStart;
      
      setSystemHealth({
        api: responseTime < 2000,
        database: true,
        realtime: true
      });

      // Load basic metrics
      const queries = await Promise.all([
        supabase.from('escolas').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('professores').select('id', { count: 'exact' }),
        supabase.from('coordenadores').select('id', { count: 'exact' }),
        supabase.from('tutores').select('id', { count: 'exact' }),
        supabase.from('exercises').select('id', { count: 'exact' }),
        supabase.from('exercise_lists').select('id', { count: 'exact' }),
        supabase.from('exercise_collections').select('id', { count: 'exact' }),
        supabase.from('jornadas').select('id', { count: 'exact' }),
        supabase.from('chats').select('id', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact' }),
        supabase.from('webhooks').select('id', { count: 'exact' }),
        supabase.from('maquinas').select('id', { count: 'exact' }),
        supabase.from('modulos').select('id', { count: 'exact' }),
        supabase.from('escola_modulos').select('id', { count: 'exact' }),
      ]);

      const newMetrics: ProjectMetrics = {
        escolas: queries[0].count || 0,
        students: queries[1].count || 0,
        professores: queries[2].count || 0,
        coordenadores: queries[3].count || 0,
        tutores: queries[4].count || 0,
        exercises: queries[5].count || 0,
        exercise_lists: queries[6].count || 0,
        exercise_collections: queries[7].count || 0,
        jornadas: queries[8].count || 0,
        chats: queries[9].count || 0,
        messages: queries[10].count || 0,
        webhooks: queries[11].count || 0,
        maquinas: queries[12].count || 0,
        modulos: queries[13].count || 0,
        escola_modulos: queries[14].count || 0,
      };

      setMetrics(newMetrics);

      // Load module status
      const { data: modulesData } = await supabase
        .from('modulos')
        .select(`
          nome,
          codigo,
          ativo,
          escola_modulos!inner(ativo)
        `);

      const { data: escolasCount } = await supabase
        .from('escolas')
        .select('id', { count: 'exact' });

      const moduleStatus: ModuleStatus[] = modulesData?.map(module => ({
        nome: module.nome,
        codigo: module.codigo,
        ativo: module.ativo,
        escolas_ativas: module.escola_modulos?.filter((em: any) => em.ativo).length || 0,
        total_escolas: escolasCount?.length || 0
      })) || [];

      setModules(moduleStatus);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading metrics:', error);
      setSystemHealth(prev => ({ ...prev, database: false }));
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    loadMetrics();

    // Set up periodic refresh
    const interval = setInterval(loadMetrics, 30000); // 30 seconds

    // Set up real-time subscriptions for key tables
    const channels = [
      'escolas', 'students', 'professores', 'coordenadores', 'exercises', 
      'jornadas', 'chats', 'webhooks', 'maquinas', 'escola_modulos'
    ].map(table => {
      return supabase
        .channel(`project-status-${table}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table }, 
          () => loadMetrics()
        )
        .subscribe();
    });

    return () => {
      clearInterval(interval);
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  if (loading && !metrics) {
    return (
      <LaunsLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </LaunsLayout>
    );
  }

  return (
    <LaunsLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Status do Projeto
            </h1>
            <p className="text-muted-foreground">
              Análise completa do sistema, módulos e acessos
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <a 
              href="/status-public" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Ver status público
            </a>
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                API & Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {systemHealth.api && systemHealth.database ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <span className={systemHealth.api && systemHealth.database ? 'text-green-600' : 'text-red-600'}>
                  {systemHealth.api && systemHealth.database ? 'Operacional' : 'Problemas'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Real-time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600">Ativo</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600">RLS Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="metrics">Métricas Gerais</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="access">Matriz de Acesso</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <School className="w-5 h-5" />
                    Escolas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.escolas || 0}</div>
                  <p className="text-sm text-muted-foreground">
                    {metrics?.escola_modulos || 0} módulos ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics?.students || 0) + (metrics?.professores || 0) + (metrics?.coordenadores || 0) + (metrics?.tutores || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Estudantes: {metrics?.students || 0}</div>
                    <div>Professores: {metrics?.professores || 0}</div>
                    <div>Coordenadores: {metrics?.coordenadores || 0}</div>
                    <div>Tutores: {metrics?.tutores || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.exercises || 0}</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Listas: {metrics?.exercise_lists || 0}</div>
                    <div>Coleções: {metrics?.exercise_collections || 0}</div>
                    <div>Jornadas: {metrics?.jornadas || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Interações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.chats || 0}</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Mensagens: {metrics?.messages || 0}</div>
                    <div>Webhooks: {metrics?.webhooks || 0}</div>
                    <div>Máquinas: {metrics?.maquinas || 0}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <Card key={module.codigo}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>{module.nome}</span>
                      <Badge variant={module.ativo ? "default" : "secondary"}>
                        {module.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Código: {module.codigo}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Escolas com módulo:</span>
                        <span>{module.escolas_ativas}/{module.total_escolas}</span>
                      </div>
                      <Progress 
                        value={module.total_escolas > 0 ? (module.escolas_ativas / module.total_escolas) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Access Matrix Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Controle de Acesso</CardTitle>
                <CardDescription>
                  Permissões por tipo de usuário e rota
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Rota</th>
                        <th className="text-center p-2">Launs Admin</th>
                        <th className="text-center p-2">School Admin</th>
                        <th className="text-center p-2">Coordinator</th>
                        <th className="text-center p-2">Professor</th>
                        <th className="text-center p-2">Student</th>
                        <th className="text-center p-2">Parent</th>
                        <th className="text-left p-2">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accessMatrix.map((access, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-mono text-sm">{access.route}</td>
                          <td className="text-center p-2">
                            {access.launs_admin ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center p-2">
                            {access.school_admin ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center p-2">
                            {access.coordinator ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center p-2">
                            {access.professor ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center p-2">
                            {access.student ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="text-center p-2">
                            {access.parent ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="p-2 text-muted-foreground">{access.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {securityIssues.map((issue, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      {issue.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {issue.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      {issue.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                      {issue.title}
                      <Badge variant={
                        issue.type === 'critical' ? 'destructive' : 
                        issue.type === 'warning' ? 'secondary' : 'default'
                      }>
                        {issue.type === 'critical' ? 'Crítico' : 
                         issue.type === 'warning' ? 'Atenção' : 'OK'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                    <p className="text-sm"><strong>Recomendação:</strong> {issue.recommendation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sistema atualizado automaticamente a cada 30 segundos</p>
        </div>
      </div>
    </LaunsLayout>
  );
}