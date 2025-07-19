import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, MessageCircle, Play, LogOut, Trophy, History, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Chat from '@/components/Chat';
import StudentJourney from '@/components/StudentJourney';

const StudentDashboard = () => {
  const { studentSession, signOut, getStudentName } = useAuth();
  const { toast } = useToast();
  const [proximaAula, setProximaAula] = useState<any>(null);
  const [jornadaAtual, setJornadaAtual] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [resultadosAnteriores, setResultadosAnteriores] = useState<any[]>([]);
  const [activeJourney, setActiveJourney] = useState(false);

  useEffect(() => {
    if (studentSession) {
      carregarDadosStudent();
    }
  }, [studentSession]);

  const carregarDadosStudent = async () => {
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

      // Buscar jornada atual
      const { data: jornadas } = await supabase
        .from('jornadas')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['pendente', 'em_andamento', 'aguardando_liberacao'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (jornadas && jornadas.length > 0) {
        setJornadaAtual(jornadas[0]);
      }

      // Buscar histórico de jornadas
      const { data: historicoData } = await supabase
        .from('jornadas')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(10);

      setHistorico(historicoData || []);

      // Buscar resultados anteriores (student_answers)
      const { data: resultados } = await supabase
        .from('student_answers')
        .select(`
          *,
          exercises:exercise_id (title, subject)
        `)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false })
        .limit(5);

      setResultadosAnteriores(resultados || []);

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

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const studentName = studentSession?.full_name || studentSession?.name || getStudentName() || 'Aluno';

  if (activeJourney && jornadaAtual) {
    return (
      <StudentJourney 
        jornada={jornadaAtual} 
        onComplete={() => {
          setActiveJourney(false);
          carregarDadosStudent();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/src/assets/colegio-almeida-garrett.png" 
                alt="Colégio Almeida Garrett" 
                className="h-12"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">Portal do Aluno</h1>
                <p className="text-sm text-muted-foreground">
                  {studentName} • Código: {studentSession?.codigo} • Turma: {studentSession?.turma}
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jornada">Jornada</TabsTrigger>
            <TabsTrigger value="chat">Chat com Tudinha</TabsTrigger>
            <TabsTrigger value="exercicios">Exercícios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                    Resultados Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {resultadosAnteriores.filter(r => r.is_correct).length}/
                    {resultadosAnteriores.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Últimas respostas corretas</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <History className="w-4 h-4 mr-2 text-blue-500" />
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

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-500" />
                    Próxima Aula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proximaAula ? (
                    <div>
                      <div className="font-semibold">{proximaAula.materia}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(proximaAula.data_hora_inicio).toLocaleTimeString()} - 
                        {proximaAula.professores?.nome}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nenhuma aula programada
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Próxima Aula */}
            {proximaAula && (
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Próxima Aula: {proximaAula.titulo}
                  </CardTitle>
                  <CardDescription>
                    {proximaAula.assunto} • Prof. {proximaAula.professores?.nome}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(proximaAula.data_hora_inicio).toLocaleString()} - {proximaAula.duracao_minutos} min
                      </p>
                    </div>
                    <Button onClick={iniciarJornada} className="flex items-center">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Jornada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Jornada Atual */}
            {jornadaAtual && (
              <Card className="bg-yellow-500/10 border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
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
                  <Button onClick={() => setActiveJourney(true)}>
                    Continuar Jornada
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Jornadas */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Jornadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historico.slice(0, 5).map((jornada) => (
                    <div key={jornada.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{jornada.aula_titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(jornada.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={jornada.status === 'finalizada' ? 'default' : 'secondary'}>
                        {jornada.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  
                  {historico.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma jornada realizada ainda
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jornada">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Jornadas</CardTitle>
                <CardDescription>
                  Acompanhe seu progresso nas atividades programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {jornadaAtual ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{jornadaAtual.aula_titulo}</h3>
                    <p>Status: <Badge>{jornadaAtual.status}</Badge></p>
                    <Button onClick={() => setActiveJourney(true)}>
                      Continuar Jornada
                    </Button>
                  </div>
                ) : proximaAula ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Pronto para começar?</h3>
                    <p className="text-muted-foreground mb-4">
                      Sua próxima jornada: {proximaAula.titulo}
                    </p>
                    <Button onClick={iniciarJornada} size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Jornada
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma jornada disponível</h3>
                    <p className="text-muted-foreground">
                      Aguarde a programação da próxima aula
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat com Tudinha
                </CardTitle>
                <CardDescription>
                  Converse com nossa IA para tirar dúvidas
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <Chat userName={studentName} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercicios">
            <Card>
              <CardHeader>
                <CardTitle>Exercícios Extras</CardTitle>
                <CardDescription>
                  Pratique com exercícios adicionais por matéria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
                  <p className="text-muted-foreground">
                    Esta funcionalidade será implementada em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;