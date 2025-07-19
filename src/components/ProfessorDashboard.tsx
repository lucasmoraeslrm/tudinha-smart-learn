import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfessorDashboardProps {
  professorData: any;
  onLogout: () => void;
}

const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ professorData, onLogout }) => {
  const [alunosOnline, setAlunosOnline] = useState<any[]>([]);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar alunos online (últimos 10 minutos)
      const { data: logs, error: logsError } = await supabase
        .from('login_logs')
        .select(`
          *,
          students:student_id (
            name,
            codigo,
            turma
          )
        `)
        .eq('status', 'ativo')
        .gte('login_time', new Date(Date.now() - 10 * 60 * 1000).toISOString())
        .order('login_time', { ascending: false });

      if (logsError) throw logsError;
      setAlunosOnline(logs || []);

      // Carregar jornadas do dia
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const amanha = new Date(hoje);
      amanha.setDate(amanha.getDate() + 1);

      const { data: jornadasData, error: jornadasError } = await supabase
        .from('jornadas')
        .select(`
          *,
          students:student_id (
            name,
            codigo,
            turma
          )
        `)
        .gte('created_at', hoje.toISOString())
        .lt('created_at', amanha.toISOString())
        .order('created_at', { ascending: false });

      if (jornadasError) throw jornadasError;
      setJornadas(jornadasData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const liberarAluno = async (jornadaId: string) => {
    try {
      const { error } = await supabase
        .from('jornadas')
        .update({ 
          status: 'em_andamento',
          inicio_real: new Date().toISOString()
        })
        .eq('id', jornadaId);

      if (error) throw error;

      toast({
        title: "Aluno liberado",
        description: "O aluno foi liberado para continuar a jornada",
      });

      carregarDados();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao liberar aluno",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizada': return 'bg-green-500';
      case 'tempo_excedido': return 'bg-red-500';
      case 'aguardando_liberacao': return 'bg-yellow-500';
      case 'em_andamento': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'finalizada': return <CheckCircle className="w-4 h-4" />;
      case 'tempo_excedido': return <XCircle className="w-4 h-4" />;
      case 'aguardando_liberacao': return <AlertCircle className="w-4 h-4" />;
      case 'em_andamento': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('professorSession');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-main p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Painel do Professor</h1>
            <p className="text-muted-foreground">Prof. {professorData.nome}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="monitoramento" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
            <TabsTrigger value="alunos-online">Alunos Online</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoramento" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Alunos Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alunosOnline.length}</div>
                  <p className="text-xs text-muted-foreground">Últimos 10 minutos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Jornadas Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jornadas.length}</div>
                  <p className="text-xs text-muted-foreground">Total do dia</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Finalizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {jornadas.filter(j => j.status === 'finalizada').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Jornadas */}
            <Card>
              <CardHeader>
                <CardTitle>Jornadas em Andamento</CardTitle>
                <CardDescription>
                  Monitore o progresso dos alunos em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jornadas
                    .filter(j => j.status !== 'finalizada')
                    .map((jornada) => (
                    <div key={jornada.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(jornada.status)}`} />
                        <div>
                          <h3 className="font-medium">{jornada.students?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {jornada.materia} - {jornada.assunto}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Turma: {jornada.students?.turma}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          {getStatusIcon(jornada.status)}
                          <span className="capitalize">{jornada.status.replace('_', ' ')}</span>
                        </Badge>
                        
                        {jornada.status === 'aguardando_liberacao' && (
                          <Button 
                            size="sm" 
                            onClick={() => liberarAluno(jornada.id)}
                          >
                            Liberar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {jornadas.filter(j => j.status !== 'finalizada').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma jornada em andamento
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alunos-online" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Alunos Online</span>
                </CardTitle>
                <CardDescription>
                  Alunos atualmente conectados ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alunosOnline.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{log.students?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Código: {log.students?.codigo} | Turma: {log.students?.turma}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Máquina: {log.maquina_codigo} | IP: {log.ip_address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">Online</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.login_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {alunosOnline.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum aluno online no momento
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Jornadas</CardTitle>
                <CardDescription>
                  Todas as jornadas do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jornadas.map((jornada) => (
                    <div key={jornada.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(jornada.status)}`} />
                        <div>
                          <h3 className="font-medium">{jornada.students?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {jornada.materia} - {jornada.assunto}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(jornada.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getStatusIcon(jornada.status)}
                        <span className="capitalize">{jornada.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  ))}
                  
                  {jornadas.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma jornada registrada hoje
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessorDashboard;