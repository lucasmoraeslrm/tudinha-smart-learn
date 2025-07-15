import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageCircle, User, Bot, TrendingUp, TrendingDown, Clock, Eye, CheckCircle, XCircle, Calendar } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email?: string;
  age?: number;
}

interface ChatLog {
  id: string;
  admin_message: string;
  ai_response: string;
  created_at: string;
  student?: Student;
}

interface StudentStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracyPercentage: number;
  lastActivity: string | null;
}

export function AdminChat() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatLog[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  // Carregar lista de alunos
  useEffect(() => {
    loadStudents();
  }, []);

  // Carregar histórico quando aluno é selecionado
  useEffect(() => {
    if (selectedStudent) {
      loadChatHistory(selectedStudent);
      loadStudentStats(selectedStudent);
    } else {
      setChatHistory([]);
      setStudentStats(null);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, email, age')
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadChatHistory = async (studentId: string, loadAll = false) => {
    try {
      const query = supabase
        .from('admin_chat_logs')
        .select(`
          id,
          admin_message,
          ai_response,
          created_at,
          students:student_id (
            id,
            name,
            email
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (!loadAll) {
        query.limit(10);
      }

      const { data, error } = await query;

      if (error) throw error;
      setChatHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadStudentStats = async (studentId: string) => {
    try {
      const { data: answers, error } = await supabase
        .from('student_answers')
        .select('is_correct, answered_at')
        .eq('student_id', studentId);

      if (error) throw error;

      const totalAnswers = answers?.length || 0;
      const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
      const accuracyPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      const lastActivity = answers && answers.length > 0 
        ? answers.sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime())[0].answered_at
        : null;

      setStudentStats({
        totalAnswers,
        correctAnswers,
        accuracyPercentage,
        lastActivity
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStudentData = async (studentId: string) => {
    try {
      // Buscar dados básicos do aluno
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Buscar últimas respostas do aluno
      const { data: answers, error: answersError } = await supabase
        .from('student_answers')
        .select(`
          user_answer,
          is_correct,
          answered_at,
          exercises:exercise_id (
            question,
            correct_answer
          )
        `)
        .eq('student_id', studentId)
        .order('answered_at', { ascending: false })
        .limit(5);

      if (answersError) throw answersError;

      // Calcular estatísticas
      const totalAnswers = answers?.length || 0;
      const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
      const accuracyPercentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      return {
        aluno: {
          nome: student.name,
          codigo: student.id,
          email: student.email,
          estatisticas: {
            acertos: correctAnswers,
            erros: totalAnswers - correctAnswers,
            porcentagem_acerto: accuracyPercentage
          },
          ultimos_exercicios: answers?.map(answer => ({
            pergunta: answer.exercises?.question || 'Pergunta não encontrada',
            resposta: answer.user_answer,
            correto: answer.is_correct,
            data: answer.answered_at
          })) || []
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados do aluno:', error);
      throw error;
    }
  };

  // Função para formatar a resposta da IA
  const formatAIResponse = (response: string) => {
    try {
      // Tentar fazer parse do JSON
      const parsed = JSON.parse(response);
      
      if (parsed.relatorio && parsed.relatorio.nome) {
        const { relatorio } = parsed;
        
        return (
          <div className="space-y-4">
            {/* Cabeçalho do relatório */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📊 Relatório do Aluno</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Nome:</span> {relatorio.nome}</div>
                <div><span className="font-medium">Código:</span> {relatorio.codigo}</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Taxa de Acerto:</span>
                  <Badge variant={relatorio.porcentagem_acertos >= 70 ? "default" : "destructive"}>
                    {relatorio.porcentagem_acertos}%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Últimos exercícios */}
            {relatorio.ultimos_exercicios && relatorio.ultimos_exercicios.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700 flex items-center gap-2">
                  📝 Últimos Exercícios ({relatorio.ultimos_exercicios.length})
                </h5>
                <div className="space-y-2">
                  {relatorio.ultimos_exercicios.map((exercicio: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 mb-1">
                            {exercicio.pergunta}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Resposta:</span> {exercicio.resposta}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exercicio.correto ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <Badge variant={exercicio.correto ? "default" : "destructive"} className="text-xs">
                            {exercicio.correto ? "Correto" : "Incorreto"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(exercicio.data).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Análise da IA */}
            {parsed.analise && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  🤖 Análise da IA
                </h5>
                <div className="text-sm text-green-700 whitespace-pre-wrap">
                  {parsed.analise}
                </div>
              </div>
            )}
          </div>
        );
      }
      
      // Se não for o formato esperado, mostrar JSON formatado
      return (
        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch (error) {
      // Se não for JSON válido, mostrar como texto
      return <div className="text-sm whitespace-pre-wrap">{response}</div>;
    }
  };

  const sendToAI = async () => {
    if (!selectedStudent || !message.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um aluno e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id || !isAdmin) {
      toast({
        title: "Erro",
        description: "Acesso negado. Você precisa estar logado como administrador para usar esta funcionalidade.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Buscar dados do aluno
      const studentData = await getStudentData(selectedStudent);

      // Preparar payload para o webhook incluindo o user_id do admin
      const payload = {
        ...studentData,
        mensagem_admin: message,
        user_id: user.id
      };

      // Enviar para o webhook do n8n
      const webhookUrl = 'https://tudinha.app.n8n.cloud/webhook/5e3882be-55ac-4266-bc42-64dbab399c41';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o webhook');
      }

      const aiData = await response.json();
      const aiResponse = aiData?.response || aiData?.mensagem || 'Resposta não disponível';

      // Salvar no banco de dados
      const { error: saveError } = await supabase
        .from('admin_chat_logs')
        .insert({
          student_id: selectedStudent,
          admin_message: message,
          ai_response: aiResponse
        });

      if (saveError) throw saveError;

      // Limpar mensagem e recarregar histórico
      setMessage('');
      await loadChatHistory(selectedStudent);

      toast({
        title: "Sucesso",
        description: "Mensagem enviada e resposta recebida!",
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat com IA - Painel Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seletor de aluno */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Aluno</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent} disabled={loadingStudents}>
              <SelectTrigger>
                <SelectValue placeholder={loadingStudents ? "Carregando alunos..." : "Escolha um aluno"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} {student.email && `(${student.email})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de mensagem */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem para a IA</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua pergunta ou observação sobre o aluno..."
              rows={3}
              disabled={!selectedStudent}
            />
          </div>

          {/* Botão enviar */}
          <Button 
            onClick={sendToAI} 
            disabled={isLoading || !selectedStudent || !message.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Consultando IA...
              </>
            ) : (
              'Enviar para IA'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Estatísticas do aluno selecionado */}
      {selectedStudent && studentStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estatísticas do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{studentStats.totalAnswers}</div>
                <div className="text-sm text-muted-foreground">Total de Respostas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{studentStats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{studentStats.accuracyPercentage}%</div>
                <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  {studentStats.lastActivity 
                    ? new Date(studentStats.lastActivity).toLocaleDateString('pt-BR')
                    : 'Sem atividade'
                  }
                </div>
                <div className="text-sm text-muted-foreground">Última Atividade</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de conversas */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico de Conversas</CardTitle>
              {chatHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowFullHistory(!showFullHistory);
                    if (!showFullHistory) {
                      loadChatHistory(selectedStudent, true);
                    } else {
                      loadChatHistory(selectedStudent, false);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {showFullHistory ? 'Ver Resumo' : 'Ver Histórico Completo'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {chatHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma conversa registrada para este aluno.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {chatHistory.length} conversa{chatHistory.length !== 1 ? 's' : ''}
                  </Badge>
                  {showFullHistory && (
                    <Badge variant="outline">Histórico completo</Badge>
                  )}
                </div>
                
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="border rounded-lg p-4 space-y-3">
                    <div className="text-xs text-muted-foreground">
                      {new Date(chat.created_at).toLocaleString('pt-BR')}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 mt-1 text-blue-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-blue-600">Admin</div>
                          <div className="text-sm">{chat.admin_message}</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 mt-1 text-green-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-600">IA</div>
                          {formatAIResponse(chat.ai_response)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}