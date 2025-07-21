import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Play, Trophy, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import StudentJourney from '@/components/StudentJourney';

const JornadaPage = () => {
  const { studentSession } = useAuth();
  const { toast } = useToast();
  const [proximaAula, setProximaAula] = useState<any>(null);
  const [jornadaAtual, setJornadaAtual] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [activeJourney, setActiveJourney] = useState(false);

  useEffect(() => {
    if (studentSession) {
      carregarDados();
    }
  }, [studentSession]);

  const carregarDados = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('studentSession') || '{}');
      const studentId = studentData.id;

      if (!studentId) return;

      // Buscar próxima aula do dia
      const agora = new Date();
      const { data: aulas } = await supabase
        .from('aulas_programadas')
        .select(`
          *,
          professores:professor_id (nome)
        `)
        .eq('turma', studentData.turma)
        .gte('data_hora_inicio', agora.toISOString())
        .order('data_hora_inicio', { ascending: true })
        .limit(1);

      if (aulas && aulas.length > 0) {
        setProximaAula(aulas[0]);
      }

      // Buscar jornadas da série do aluno
      const { data: jornadas } = await supabase
        .from('jornadas')
        .select('*')
        .eq('serie_ano_letivo', studentData.ano_letivo)
        .eq('serie_turma', studentData.turma)
        .in('status', ['pendente', 'em_andamento', 'aguardando_liberacao'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (jornadas && jornadas.length > 0) {
        setJornadaAtual(jornadas[0]);
      }

      // Buscar histórico de jornadas da série
      const { data: historicoData } = await supabase
        .from('jornadas')
        .select('*')
        .eq('serie_ano_letivo', studentData.ano_letivo)
        .eq('serie_turma', studentData.turma)
        .order('created_at', { ascending: false })
        .limit(10);

      setHistorico(historicoData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const iniciarJornada = async () => {
    try {
      if (!proximaAula) {
        toast({
          title: "Nenhuma aula disponível",
          description: "Não há aulas programadas para agora",
          variant: "destructive",
        });
        return;
      }

      const studentData = JSON.parse(localStorage.getItem('studentSession') || '{}');
      
      // Criar nova jornada
      const { data: novaJornada, error } = await supabase
        .from('jornadas')
        .insert({
          student_id: studentData.id,
          aula_titulo: proximaAula.titulo,
          professor_nome: proximaAula.professores?.nome,
          materia: proximaAula.materia,
          assunto: proximaAula.assunto,
          inicio_previsto: proximaAula.data_hora_inicio,
          fim_previsto: proximaAula.data_hora_fim,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      setJornadaAtual(novaJornada);
      setActiveJourney(true);
      
      toast({
        title: "Jornada iniciada!",
        description: `Bem-vindo à aula de ${proximaAula.materia}`,
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a jornada",
        variant: "destructive",
      });
    }
  };

  if (activeJourney && jornadaAtual) {
    return (
      <StudentJourney 
        jornada={jornadaAtual} 
        onComplete={() => {
          setActiveJourney(false);
          carregarDados();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jornada de Aprendizagem</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso nas atividades programadas</p>
      </div>

      {/* Jornada Atual */}
      {jornadaAtual ? (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-600" />
              Jornada em Andamento
              <Badge variant="outline" className="ml-2 capitalize">
                {jornadaAtual.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {jornadaAtual.materia} - {jornadaAtual.assunto}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Professor: {jornadaAtual.professor_nome}
              </p>
              <Button onClick={() => setActiveJourney(true)} size="lg">
                <Play className="w-4 h-4 mr-2" />
                Continuar Jornada
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : proximaAula ? (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Próxima Aula: {proximaAula.titulo}
            </CardTitle>
            <CardDescription>
              {proximaAula.assunto} • Prof. {proximaAula.professores?.nome}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                {new Date(proximaAula.data_hora_inicio).toLocaleString()} • {proximaAula.duracao_minutos} min
              </div>
              <Button onClick={iniciarJornada} size="lg" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Jornada
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Nenhuma jornada disponível
            </CardTitle>
            <CardDescription>
              Aguarde a programação da próxima aula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Em breve novas jornadas estarão disponíveis
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Jornadas Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historico.filter(j => j.status === 'finalizada').length}
            </div>
            <p className="text-xs text-muted-foreground">Total concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historico.filter(j => j.status === 'em_andamento').length}
            </div>
            <p className="text-xs text-muted-foreground">Ativas agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <History className="w-4 h-4 mr-2 text-green-500" />
              Total de Jornadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historico.length}
            </div>
            <p className="text-xs text-muted-foreground">Todas as jornadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Jornadas */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Jornadas</CardTitle>
          <CardDescription>Suas últimas jornadas de aprendizagem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.slice(0, 10).map((jornada) => (
              <div key={jornada.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{jornada.aula_titulo}</h4>
                  <p className="text-sm text-muted-foreground">
                    {jornada.materia} • {new Date(jornada.created_at).toLocaleDateString()}
                  </p>
                  {jornada.professor_nome && (
                    <p className="text-xs text-muted-foreground">
                      Prof. {jornada.professor_nome}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={jornada.status === 'finalizada' ? 'default' : 'secondary'}>
                    {jornada.status.replace('_', ' ')}
                  </Badge>
                  {jornada.status === 'finalizada' && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
            
            {historico.length === 0 && (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma jornada realizada ainda</h3>
                <p className="text-muted-foreground">
                  Suas jornadas aparecerão aqui conforme você for completando
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JornadaPage;