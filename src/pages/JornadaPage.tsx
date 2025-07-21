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

      console.log('Student data:', studentData);
      console.log('Student ano_letivo:', studentData.ano_letivo, 'Student turma:', studentData.turma);

      // Buscar jornadas disponíveis para a série do aluno
      const hoje = new Date();
      console.log('Data atual:', hoje.toISOString());
      
      const { data: jornadas, error } = await supabase
        .from('jornadas')
        .select('*')
        .eq('serie_ano_letivo', studentData.ano_letivo)
        .eq('serie_turma', studentData.turma)
        .in('status', ['pendente', 'em_andamento', 'aguardando_liberacao'])
        .order('created_at', { ascending: false });

      console.log('Jornadas query result:', { jornadas, error });
      console.log('Filtros aplicados:', {
        serie_ano_letivo: studentData.ano_letivo,
        serie_turma: studentData.turma
      });

      // Debug: buscar TODAS as jornadas para comparar
      const { data: todasJornadas, error: errorTodas } = await supabase
        .from('jornadas')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('TODAS as jornadas no banco:', todasJornadas);
      console.log('Error todas jornadas:', errorTodas);

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
      if (!jornadaAtual) {
        toast({
          title: "Nenhuma jornada disponível",
          description: "Não há jornadas programadas para hoje",
          variant: "destructive",
        });
        return;
      }

      const studentData = JSON.parse(localStorage.getItem('studentSession') || '{}');
      
      // Atualizar status da jornada para em_andamento
      const { error } = await supabase
        .from('jornadas')
        .update({
          status: 'em_andamento',
          inicio_real: new Date().toISOString(),
          student_id: studentData.id
        })
        .eq('id', jornadaAtual.id);

      if (error) throw error;

      // Atualizar estado local
      setJornadaAtual({
        ...jornadaAtual,
        status: 'em_andamento',
        inicio_real: new Date().toISOString(),
        student_id: studentData.id
      });
      
      setActiveJourney(true);
      
      toast({
        title: "Jornada iniciada!",
        description: `Bem-vindo à jornada de ${jornadaAtual.materia}`,
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
        <Card className={`${
          jornadaAtual.status === 'em_andamento' 
            ? 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20' 
            : 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className={`w-5 h-5 mr-2 ${
                jornadaAtual.status === 'em_andamento' ? 'text-green-600' : 'text-yellow-600'
              }`} />
              {jornadaAtual.status === 'em_andamento' ? 'Jornada em Andamento' : 'Jornada Disponível'}
              <Badge variant="outline" className="ml-2 capitalize">
                {jornadaAtual.status.replace('_', ' ')}
              </Badge>
            </CardTitle>
            <CardDescription>
              {jornadaAtual.materia} - {jornadaAtual.assunto || jornadaAtual.aula_titulo}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jornadaAtual.professor_nome && (
                <p className="text-sm text-muted-foreground">
                  Professor: {jornadaAtual.professor_nome}
                </p>
              )}
              {jornadaAtual.status === 'em_andamento' ? (
                <Button onClick={() => setActiveJourney(true)} size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Jornada
                </Button>
              ) : (
                <Button onClick={iniciarJornada} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Jornada
                </Button>
              )}
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
              Não há jornadas programadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aguarde novas jornadas serem criadas pelo professor
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