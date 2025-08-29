import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Users, School, BookOpen, Database } from 'lucide-react';

interface PublicMetrics {
  total_escolas: number;
  total_usuarios: number;
  total_exercicios: number;
  total_jornadas: number;
  sistema_ativo: boolean;
  ultima_atualizacao: Date;
}

export default function PublicStatus() {
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({ api: true, database: true });

  const loadPublicMetrics = async () => {
    try {
      setLoading(true);
      
      // Test system health
      const healthStart = Date.now();
      await supabase.from('escolas').select('count').limit(1);
      const responseTime = Date.now() - healthStart;
      
      setSystemHealth({
        api: responseTime < 3000,
        database: true
      });

      // Load basic aggregated metrics (no sensitive data)
      const [escolasResult, studentsResult, professoresResult, exercisesResult, jornadasResult] = await Promise.all([
        supabase.from('escolas').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('professores').select('id', { count: 'exact' }),
        supabase.from('exercises').select('id', { count: 'exact' }),
        supabase.from('jornadas').select('id', { count: 'exact' }),
      ]);

      const newMetrics: PublicMetrics = {
        total_escolas: escolasResult.count || 0,
        total_usuarios: (studentsResult.count || 0) + (professoresResult.count || 0),
        total_exercicios: exercisesResult.count || 0,
        total_jornadas: jornadasResult.count || 0,
        sistema_ativo: responseTime < 3000,
        ultima_atualizacao: new Date()
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error loading public metrics:', error);
      setSystemHealth(prev => ({ ...prev, database: false }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadPublicMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Status do Sistema
          </h1>
          <p className="text-muted-foreground">
            Informações públicas sobre o estado da plataforma
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Atualizado às {metrics?.ultima_atualizacao.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* System Health Status */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Database className="w-6 h-6" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {systemHealth.api && systemHealth.database ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                )}
              </div>
              <Badge 
                variant={systemHealth.api && systemHealth.database ? "default" : "destructive"}
                className="text-lg px-4 py-2"
              >
                {systemHealth.api && systemHealth.database ? 'Sistema Operacional' : 'Sistema com Problemas'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Public Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <School className="w-6 h-6 text-primary" />
                Escolas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary">
                {metrics?.total_escolas || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Instituições conectadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary">
                {metrics?.total_usuarios || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estudantes e professores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Exercícios
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary">
                {metrics?.total_exercicios || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Atividades disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center pb-3">
              <CardTitle className="flex items-center justify-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Jornadas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-primary">
                {metrics?.total_jornadas || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Percursos de aprendizagem
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Esta página mostra informações básicas sobre o sistema.<br />
            Para acesso completo aos dados e métricas, faça login na plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}