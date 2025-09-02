import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, Clock, CheckCircle, BookOpen, MapPin } from 'lucide-react';

interface ProfessorDashboardMainProps {
  professorData: any;
}

export default function ProfessorDashboardMain({ professorData }: ProfessorDashboardMainProps) {
  const [stats, setStats] = useState({
    totalAlunos: 0,
    jornadasAtivas: 0,
    jornadasConcluidas: 0,
    exerciciosDisponiveis: 0
  });
  const [recentJornadas, setRecentJornadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [professorData]);

  const carregarDados = async () => {
    if (!professorData?.codigo) return;

    try {
      // Buscar alunos do professor
      const { data: alunos } = await supabase.rpc('get_professor_students', {
        professor_codigo: professorData.codigo
      });

      // Buscar jornadas do professor
      const { data: jornadas } = await supabase
        .from('jornadas')
        .select('*')
        .eq('professor_nome', professorData.nome)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calcular estatísticas
      const jornadasAtivas = jornadas?.filter(j => j.status === 'em_andamento').length || 0;
      const jornadasConcluidas = jornadas?.filter(j => j.status === 'concluida').length || 0;

      // Buscar exercícios disponíveis
      const { data: exercicios } = await supabase
        .from('exercises')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalAlunos: alunos?.length || 0,
        jornadasAtivas,
        jornadasConcluidas,
        exerciciosDisponiveis: exercicios?.length || 0
      });

      setRecentJornadas(jornadas || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo, Prof. {professorData?.nome?.split(' ')[0]}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              Alunos sob sua responsabilidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jornadas Ativas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jornadasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Em andamento agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jornadas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jornadasConcluidas}</div>
            <p className="text-xs text-muted-foreground">
              Finalizadas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exercícios</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exerciciosDisponiveis}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis no sistema
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jornadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Jornadas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentJornadas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma jornada encontrada
            </p>
          ) : (
            <div className="space-y-4">
              {recentJornadas.map((jornada) => (
                <div key={jornada.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{jornada.aula_titulo}</h4>
                    <p className="text-sm text-muted-foreground">
                      {jornada.materia} • {jornada.assunto}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(jornada.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(jornada.status)}>
                    {jornada.status?.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}