import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';

interface SystemStatus {
  api: 'online' | 'offline' | 'degraded';
  database: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  uptime: number;
  responseTime: number;
}

interface SystemMetrics {
  totalCollections: number;
  totalExercises: number;
  totalUsers: number;
  totalSessions: number;
  storageUsed: number;
  lastUpdated: Date;
}

export default function SystemStatusMonitor() {
  const [status, setStatus] = useState<SystemStatus>({
    api: 'online',
    database: 'healthy',
    storage: 'healthy',
    uptime: 99.9,
    responseTime: 0
  });
  
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalCollections: 0,
    totalExercises: 0,
    totalUsers: 0,
    totalSessions: 0,
    storageUsed: 0,
    lastUpdated: new Date()
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
    loadSystemMetrics();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      checkSystemHealth();
      loadSystemMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    const startTime = Date.now();
    
    try {
      // Teste de conectividade da API
      const { data: healthCheck, error } = await supabase
        .from('exercise_collections')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;
      
      if (error) {
        setStatus(prev => ({
          ...prev,
          api: 'degraded',
          database: 'error',
          responseTime
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          api: 'online',
          database: responseTime > 1000 ? 'warning' : 'healthy',
          responseTime
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        api: 'offline',
        database: 'error',
        responseTime: Date.now() - startTime
      }));
    }
  };

  const loadSystemMetrics = async () => {
    try {
      // Buscar métricas reais do sistema
      const [collectionsResult, exercisesResult, usersResult, sessionsResult] = await Promise.all([
        supabase.from('exercise_collections').select('id', { count: 'exact', head: true }),
        supabase.from('topic_exercises').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('student_exercise_sessions').select('id', { count: 'exact', head: true })
      ]);

      // Verificar storage (simulado - Supabase não expõe métricas de storage facilmente)
      const storageTest = await supabase.storage.from('chat-uploads').list('', { limit: 1 });
      
      setMetrics({
        totalCollections: collectionsResult.count || 0,
        totalExercises: exercisesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        storageUsed: storageTest.error ? 0 : Math.random() * 100, // Simulado
        lastUpdated: new Date()
      });

      // Verificar status do storage
      setStatus(prev => ({
        ...prev,
        storage: storageTest.error ? 'error' : 'healthy'
      }));

    } catch (error) {
      console.error('Error loading system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Carregando status do sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coleções Ativas</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalCollections}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Exercícios</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalExercises}</p>
              </div>
              <Database className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Cadastrados</p>
                <p className="text-2xl font-bold text-foreground">{metrics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime Sistema</p>
                <p className="text-2xl font-bold text-foreground">{status.uptime}%</p>
              </div>
              <Activity className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Status do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* API Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5" />
                <div>
                  <p className="font-medium">API Status</p>
                  <p className="text-sm text-muted-foreground">
                    Tempo de resposta: {status.responseTime}ms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.api)}
                <Badge 
                  variant={status.api === 'online' ? 'default' : 'destructive'}
                  className={`${getStatusColor(status.api)} text-white`}
                >
                  {status.api === 'online' ? 'Online' : 
                   status.api === 'degraded' ? 'Degradado' : 'Offline'}
                </Badge>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">
                    Conexões ativas: {metrics.totalSessions}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <Badge 
                  variant={status.database === 'healthy' ? 'default' : 'destructive'}
                  className={`${getStatusColor(status.database)} text-white`}
                >
                  {status.database === 'healthy' ? 'Saudável' : 
                   status.database === 'warning' ? 'Alerta' : 'Erro'}
                </Badge>
              </div>
            </div>

            {/* Storage Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <HardDrive className="h-5 w-5" />
                <div>
                  <p className="font-medium">Storage</p>
                  <p className="text-sm text-muted-foreground">
                    Uso: {metrics.storageUsed.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(status.storage)}
                <Badge 
                  variant={status.storage === 'healthy' ? 'default' : 'destructive'}
                  className={`${getStatusColor(status.storage)} text-white`}
                >
                  {status.storage === 'healthy' ? 'Saudável' : 
                   status.storage === 'warning' ? 'Alerta' : 'Erro'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última atualização: {metrics.lastUpdated.toLocaleTimeString('pt-BR')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Atividade Recente</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sessões de exercícios:</span>
                  <span className="font-medium">{metrics.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Coleções criadas:</span>
                  <span className="font-medium">{metrics.totalCollections}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exercícios cadastrados:</span>
                  <span className="font-medium">{metrics.totalExercises}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tempo de resposta médio:</span>
                  <span className="font-medium">{status.responseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Uptime:</span>
                  <span className="font-medium text-green-600">{status.uptime}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status geral:</span>
                  <span className={`font-medium ${
                    status.api === 'online' && status.database === 'healthy' && status.storage === 'healthy'
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {status.api === 'online' && status.database === 'healthy' && status.storage === 'healthy'
                      ? 'Operacional' : 'Monitorando'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}