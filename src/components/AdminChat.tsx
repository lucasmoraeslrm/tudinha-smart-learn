import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEscola } from '@/hooks/useEscola';
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
  const { user, isAdmin, isSchoolAdmin } = useAuth();
  const { escola } = useEscola();

  // Carregar lista de alunos
  useEffect(() => {
    loadStudents();
  }, [escola?.id]);

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
      let query = supabase
        .from('students')
        .select('id, name, email, age');
      
      // Filter by school for coordinators
      if (escola?.id) {
        query = query.eq('escola_id', escola.id);
      }
      
      const { data, error } = await query.order('name');

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
          exercises!exercise_id (
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
      
      // Verificar se é resposta do n8n no novo formato
      if (parsed && typeof parsed === 'object' && parsed.resposta) {
        try {
          const respostaData = JSON.parse(parsed.resposta);
          
          return (
            <div className="space-y-4 animate-fade-in">
              {/* Resumo Geral */}
              {respostaData.resumo_geral && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Resumo Geral
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {respostaData.resumo_geral}
                  </div>
                </div>
              )}

              {/* Erros (se houver) */}
              {respostaData.erros && respostaData.erros.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 shadow-sm">
                  <h5 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    Questões que Precisam de Atenção
                  </h5>
                  <div className="space-y-3">
                    {respostaData.erros.map((erro: any, index: number) => (
                      <div key={index} className="bg-white/50 p-4 rounded-lg border border-orange-100">
                        <div className="mb-2">
                          <span className="font-medium text-orange-900">Pergunta:</span>
                          <div className="text-sm text-orange-800 mt-1">{erro.pergunta}</div>
                        </div>
                        {erro.resposta_errada && (
                          <div className="mb-2">
                            <span className="font-medium text-orange-900">Resposta dada:</span>
                            <div className="text-sm text-orange-700 mt-1">{erro.resposta_errada}</div>
                          </div>
                        )}
                        {erro.explicacao && (
                          <div>
                            <span className="font-medium text-orange-900">Explicação:</span>
                            <div className="text-sm text-orange-700 mt-1">{erro.explicacao}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendações */}
              {respostaData.recomendacoes && respostaData.recomendacoes.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
                  <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Recomendações para o Estudante
                  </h5>
                  <div className="space-y-3">
                    {respostaData.recomendacoes.map((recomendacao: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-white/30 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-green-700 leading-relaxed">{recomendacao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        } catch (parseError) {
          // Se não conseguir fazer parse da resposta interna, mostrar como string
          return <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{parsed.resposta}</div>;
        }
      }
      
      // Verificar se é array (formato n8n antigo)
      if (Array.isArray(parsed) && parsed[0] && parsed[0].resposta) {
        const n8nResponse = parsed[0];
        try {
          const respostaData = JSON.parse(n8nResponse.resposta);
          
          return (
            <div className="space-y-4 animate-fade-in">
              {/* Resumo Geral */}
              {respostaData.resumo_geral && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-sm">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Resumo Geral
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {respostaData.resumo_geral}
                  </div>
                </div>
              )}

              {/* Recomendações */}
              {respostaData.recomendacoes && respostaData.recomendacoes.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
                  <h5 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Recomendações para o Estudante
                  </h5>
                  <div className="space-y-3">
                    {respostaData.recomendacoes.map((recomendacao: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 bg-white/30 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="text-sm text-green-700 leading-relaxed">{recomendacao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        } catch (parseError) {
          // Se não conseguir fazer parse da resposta interna, mostrar como string
          return <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{n8nResponse.resposta}</div>;
        }
      }
      
      // Formato antigo do relatório
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
      
      // Se não for o formato esperado, mostrar JSON formatado (mas limpo)
      const cleanData = { ...parsed };
      // Remover campos técnicos se existirem
      delete cleanData.success;
      delete cleanData.user_id;
      delete cleanData.timestamp;
      
      return (
        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(cleanData, null, 2)}
        </pre>
      );
    } catch (error) {
      // Se não for JSON válido, mostrar como texto
      return <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{response}</div>;
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

    if (!user?.id || (!isAdmin && !isSchoolAdmin)) {
      toast({
        title: "Erro",
        description: "Acesso negado. Você precisa estar logado como administrador ou coordenador para usar esta funcionalidade.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Buscar dados do aluno
      const studentData = await getStudentData(selectedStudent);

      // Converter dados do aluno para string
      const studentDataString = JSON.stringify(studentData, null, 2);

      // Preparar payload para o webhook com aluno como string
      const payload = {
        aluno: studentDataString,
        mensagem_admin: message,
        user_id: user.id
      };

      // Enviar para o webhook do n8n
      const webhookUrl = 'https://tudinha.app.n8n.cloud/webhook/5e3882be-55ac-4266-bc42-64dbab399c41';
      
      console.log('Enviando dados para webhook:', payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Permitir CORS
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do webhook:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      // Verificar se há conteúdo na resposta
      const responseText = await response.text();
      console.log('Texto da resposta:', responseText);
      
      let aiResponse = 'Mensagem enviada com sucesso para o webhook';
      
      if (responseText && responseText.trim()) {
        try {
          // Tentar fazer parse da resposta JSON
          const aiData = JSON.parse(responseText);
          
          // Se for array com resposta do n8n, usar o JSON completo
          if (Array.isArray(aiData) && aiData[0] && aiData[0].resposta) {
            aiResponse = responseText; // Salvar o JSON completo para formatação posterior
          } else {
            // Formato antigo ou outro formato
            aiResponse = aiData?.response || aiData?.mensagem || responseText;
          }
        } catch (jsonError) {
          console.log('Resposta não é JSON válido, usando resposta como texto:', responseText);
          aiResponse = responseText;
        }
      }

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