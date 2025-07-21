import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  BookOpen, 
  Play, 
  Send,
  ArrowRight,
  Timer,
  Brain,
  User,
  Bot
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudentJourneyProps {
  jornada: any;
  onComplete: () => void;
}

const StudentJourney: React.FC<StudentJourneyProps> = ({ jornada, onComplete }) => {
  const { studentSession } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [resumoInicial, setResumoInicial] = useState('');
  const [tempoResumo, setTempoResumo] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{pergunta: string, resposta: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [exercicios, setExercicios] = useState<any[]>([]);
  const [respostasExercicio, setRespostasExercicio] = useState<{[key: string]: string}>({});
  const [tempoExercicio, setTempoExercicio] = useState(0);
  const [isExerciseTimerRunning, setIsExerciseTimerRunning] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<{acertos: number, erros: number, tempo: string} | null>(null);
  const [aguardandoLiberacao, setAguardandoLiberacao] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  const N8N_WEBHOOK_URL = 'https://n8n.srv863581.hstgr.cloud/webhook/aff2ff16-db64-4463-92ee-285a68f249d3';

  const steps = [
    { id: 1, title: 'Boas-vindas', description: 'Mensagem personalizada' },
    { id: 2, title: 'Resumo Inicial', description: 'Conte o que você sabe sobre o assunto' },
    { id: 3, title: 'Explicação', description: 'IA explica o conteúdo' },
    { id: 4, title: 'Perguntas', description: 'Tire suas dúvidas' },
    { id: 5, title: 'Exercícios', description: 'Resolva os exercícios' },
    { id: 6, title: 'Resultados', description: 'Veja seu desempenho' }
  ];

  useEffect(() => {
    if (currentStep === 1) {
      initializeJourney();
    }
  }, []);

  // Timer para resumo inicial
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTempoResumo(prev => {
          const newTime = prev + 1;
          // Se passou de 5 minutos, enviar webhook de notificação
          if (newTime === 300) {
            sendTimeoutNotification();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Timer para exercícios
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExerciseTimerRunning) {
      interval = setInterval(() => {
        setTempoExercicio(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExerciseTimerRunning]);

  const sendWebhookMessage = async (data: any) => {
    try {
      console.log('Enviando dados para webhook N8N via Edge Function:', data);
      
      const response = await fetch('https://pwdkfekouyyujfwmgqls.supabase.co/functions/v1/send-n8n-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZGtmZWtvdXl5dWpmd21ncWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mjc4OTQsImV4cCI6MjA2ODEwMzg5NH0.FQfRU7zv5Y2cj2CZT6KFdciekApZl8NxThZjfTNLzko`,
        },
        body: JSON.stringify({ webhookData: data }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Resposta da Edge Function:', result);
        
        if (result.success && result.data) {
          return result.data;
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Erro ao enviar webhook via Edge Function:', error);
      
      // Fallback: tentar envio direto
      try {
        console.log('Tentando envio direto para N8N...');
        
        await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(data),
        });

        console.log('Webhook enviado diretamente com sucesso');
        return null; // Modo no-cors não permite ler resposta
        
      } catch (directError) {
        console.error('Erro no envio direto também:', directError);
        return null;
      }
    }
  };

  const sendTimeoutNotification = async () => {
    if (!studentSession) return;

    await sendWebhookMessage({
      aluno: {
        id: studentSession.id,
        nome: studentSession.name
      },
      mensagem: {
        evento: "sem_resposta",
        etapa: "resumo_inicial",
        maquina: "N/A"
      }
    });

    setAguardandoLiberacao(true);
    setIsTimerRunning(false);
    
    await supabase
      .from('jornadas')
      .update({ status: 'aguardando_liberacao' })
      .eq('id', jornada.id);

    toast({
      title: "Tempo esgotado",
      description: "O professor foi notificado. Aguarde a liberação para continuar.",
      variant: "destructive",
    });
  };

  const initializeJourney = async () => {
    try {
      setLoading(true);
      
      // Atualizar status da jornada
      await supabase
        .from('jornadas')
        .update({ 
          status: 'em_andamento',
          inicio_real: new Date().toISOString()
        })
        .eq('id', jornada.id);

      // Mensagem simples de boas-vindas conforme solicitado
      const mensagemBoasVindas = `Olá ${studentSession?.name || 'aluno'}! 👋
Bem-vindo à sua jornada de hoje.
Clique no botão abaixo para começar! 🚀`;

      setAiMessage(mensagemBoasVindas);
      
    } catch (error) {
      console.error('Erro ao inicializar jornada:', error);
      toast({
        title: "Erro",
        description: "Erro ao inicializar a jornada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepTwoSubmit = async () => {
    if (!resumoInicial.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, escreva o que você sabe sobre o assunto antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (aguardandoLiberacao) {
      toast({
        title: "Aguardando liberação",
        description: "Aguarde o professor liberar para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsTimerRunning(false);
    setLoading(true);

    // Salvar resumo inicial no banco
    await supabase
      .from('jornadas')
      .update({ 
        resumo_inicial: resumoInicial,
        tempo_resumo_segundos: tempoResumo
      })
      .eq('id', jornada.id);

    // Enviar dados para o webhook n8n para gerar explicação
    if (studentSession) {
      const response = await sendWebhookMessage({
        aluno: {
          id: studentSession.id,
          nome: studentSession.name
        },
        mensagem: {
          evento: "explicacao",
          etapa: "explicacao",
          resposta_aluno: resumoInicial,
          assunto_admin: jornada.assunto
        }
      });

      // Se recebeu resposta do N8N, usar ela, senão usar mensagem padrão
      if (response && response.explicacao) {
        setAiMessage(response.explicacao);
      } else {
        // Mensagem padrão caso N8N não responda
        const explicacaoIA = `Muito bem! Com base no que você compartilhou sobre ${jornada.assunto}, vou explicar os conceitos principais.

Esta explicação foi personalizada com base no seu conhecimento prévio. Agora você pode fazer perguntas sobre qualquer parte que não entendeu!`;
        setAiMessage(explicacaoIA);
      }
    }

    setLoading(false);
    setCurrentStep(3);
  };

  const handleSendQuestion = async () => {
    if (!currentQuestion.trim() || !studentSession) return;

    setSendingMessage(true);

    // Adicionar pergunta à lista de mensagens
    const novaPergunta = currentQuestion;
    setCurrentQuestion('');

    // Enviar pergunta para o webhook n8n
    const response = await sendWebhookMessage({
      aluno: {
        id: studentSession.id,
        nome: studentSession.name
      },
      mensagem: {
        evento: "duvida_aluno",
        etapa: "duvidas",
        pergunta: novaPergunta,
        assunto: jornada.assunto
      }
    });

    // Se recebeu resposta do N8N, usar ela, senão usar mensagem padrão
    let respostaIA = `Obrigado pela sua pergunta! Esta é uma resposta automática enquanto o sistema N8N está sendo configurado.`;
    
    if (response && response.resposta) {
      respostaIA = response.resposta;
    }

    // Adicionar à lista de mensagens
    setChatMessages(prev => [...prev, {
      pergunta: novaPergunta,
      resposta: respostaIA
    }]);

    setSendingMessage(false);
  };

  const loadExercises = async () => {
    try {
      // Usar os exercise_ids da jornada atual
      if (!jornada.exercise_ids || jornada.exercise_ids.length === 0) {
        toast({
          title: "Nenhum exercício vinculado",
          description: "Esta jornada não possui exercícios vinculados.",
          variant: "destructive",
        });
        return;
      }

      const { data: exerciciosData } = await supabase
        .from('jornada_exercises')
        .select('*')
        .in('id', jornada.exercise_ids);

      if (exerciciosData && exerciciosData.length > 0) {
        // Embaralhar exercícios de forma aleatória para cada aluno
        const exerciciosEmbaralhados = [...exerciciosData].sort(() => Math.random() - 0.5);
        setExercicios(exerciciosEmbaralhados);
        setIsExerciseTimerRunning(true);
      } else {
        toast({
          title: "Exercícios não encontrados",
          description: "Os exercícios vinculados a esta jornada não foram encontrados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    }
  };

  const handleExerciseAnswer = (exercicioId: string, resposta: string) => {
    setRespostasExercicio(prev => ({
      ...prev,
      [exercicioId]: resposta
    }));
  };

  const finishExercises = async () => {
    setIsExerciseTimerRunning(false);
    
    // Calcular resultados
    let acertos = 0;
    exercicios.forEach(exercicio => {
      if (respostasExercicio[exercicio.id] === exercicio.correct_answer) {
        acertos++;
      }
    });
    
    const erros = exercicios.length - acertos;
    const tempoFormatado = formatTime(tempoExercicio);
    
    const resultado = {
      acertos,
      erros,
      tempo: tempoFormatado
    };
    
    setExerciseResults(resultado);

    // Enviar resultado para o webhook n8n
    if (studentSession) {
      await sendWebhookMessage({
        aluno: {
          id: studentSession.id,
          nome: studentSession.name
        },
        mensagem: {
          evento: "resultado_exercicio",
          etapa: "exercicios",
          acertos: acertos,
          erros: erros,
          tempo: tempoFormatado
        }
      });
    }

    // Salvar resultado no banco
    await supabase
      .from('jornadas')
      .update({ 
        resultado_exercicio: resultado
      })
      .eq('id', jornada.id);

    setCurrentStep(6);
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setIsTimerRunning(true);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
      await loadExercises();
    } else if (currentStep === 6) {
      // Finalizar jornada
      await supabase
        .from('jornadas')
        .update({ 
          status: 'finalizada',
          fim_real: new Date().toISOString()
        })
        .eq('id', jornada.id);
      
      toast({
        title: "Jornada concluída!",
        description: "Parabéns por completar sua jornada de aprendizado!",
      });
      
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min${secs.toString().padStart(2, '0')}s`;
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Boas-vindas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-lg leading-relaxed text-center py-4">
                {aiMessage}
              </div>
              <Button className="mt-4 w-full" size="lg" onClick={handleNextStep}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Vamos Começar
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  Resumo Inicial
                </div>
                <div className="flex items-center text-sm">
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTime(tempoResumo)}
                  {tempoResumo > 300 && (
                    <AlertCircle className="w-4 h-4 ml-2 text-red-500" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm font-medium">
                  Conte com suas palavras o que você já sabe sobre o assunto de hoje.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você tem 5 minutos para escrever. Se não responder, o professor será notificado.
                </p>
              </div>
              
              {aguardandoLiberacao && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="text-sm font-medium">Aguardando liberação do professor</span>
                  </div>
                </div>
              )}
              
              <Textarea
                placeholder="Escreva aqui o que você sabe sobre o assunto..."
                value={resumoInicial}
                onChange={(e) => setResumoInicial(e.target.value)}
                rows={6}
                disabled={aguardandoLiberacao}
              />
               <Button 
                 onClick={handleStepTwoSubmit}
                 disabled={!resumoInicial.trim() || aguardandoLiberacao || loading}
                 className="w-full"
                 size="lg"
               >
                 <Send className="w-4 h-4 mr-2" />
                 {loading ? 'Processando...' : 'Enviar Resumo'}
               </Button>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Explicação do Conteúdo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm leading-relaxed mb-4 bg-white/5 p-4 rounded-lg">
                {aiMessage}
              </div>
              <Button onClick={handleNextStep} size="lg" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Entendido, continuar
              </Button>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Perguntas e Dúvidas
              </CardTitle>
              <CardDescription>
                Tire suas dúvidas sobre o conteúdo com a IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Histórico de mensagens */}
              {chatMessages.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="space-y-2">
                      <div className="bg-blue-500/10 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <User className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Você</span>
                        </div>
                        <p className="text-sm">{msg.pergunta}</p>
                      </div>
                      <div className="bg-green-500/10 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <Bot className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">IA</span>
                        </div>
                        <p className="text-sm">{msg.resposta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm mb-2">💡 Você pode perguntar sobre:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Conceitos que não ficaram claros</li>
                  <li>Exemplos práticos do assunto</li>
                  <li>Como aplicar na vida real</li>
                  <li>Curiosidades relacionadas</li>
                </ul>
              </div>
              
              <Textarea
                placeholder="Digite sua pergunta aqui..."
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                rows={3}
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSendQuestion}
                  disabled={!currentQuestion.trim() || sendingMessage}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendingMessage ? 'Enviando...' : 'Fazer Pergunta'}
                </Button>
                <Button onClick={handleNextStep}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Ir para Exercícios
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="bg-gradient-to-r from-red-500/10 to-purple-500/10 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Exercícios Práticos
                </div>
                <div className="flex items-center text-sm">
                  <Timer className="w-4 h-4 mr-1" />
                  {formatTime(tempoExercicio)}
                </div>
              </CardTitle>
              <CardDescription>
                6 questões: 2 fáceis, 2 intermediárias, 2 difíceis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercicios.length > 0 ? (
                <>
                  {exercicios.map((exercicio, index) => (
                    <div key={exercicio.id} className="bg-white/5 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          Questão {index + 1} - {exercicio.nivel_dificuldade}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{exercicio.question}</h4>
                      <div className="space-y-2">
                        {exercicio.options.map((opcao: string, optIndex: number) => (
                          <Button
                            key={optIndex}
                            variant={respostasExercicio[exercicio.id] === opcao ? "default" : "outline"}
                            className="w-full justify-start text-left"
                            onClick={() => handleExerciseAnswer(exercicio.id, opcao)}
                          >
                            {String.fromCharCode(65 + optIndex)}) {opcao}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={finishExercises}
                    disabled={Object.keys(respostasExercicio).length < exercicios.length}
                    size="lg" 
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Exercícios
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p>Carregando exercícios...</p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Resultados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Parabéns!</h3>
                <p className="text-muted-foreground">
                  Você completou sua jornada de aprendizado sobre {jornada.assunto}
                </p>
              </div>
              
              {exerciseResults && (
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 text-center">📈 Resultado dos Exercícios</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-500">{exerciseResults.acertos}</div>
                      <div className="text-sm text-muted-foreground">Acertos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">{exerciseResults.erros}</div>
                      <div className="text-sm text-muted-foreground">Erros</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-500">{exerciseResults.tempo}</div>
                      <div className="text-sm text-muted-foreground">Tempo</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="font-semibold">Tempo de Resumo</div>
                  <div className="text-sm text-muted-foreground">{formatTime(tempoResumo)}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg text-center">
                  <div className="font-semibold">Status</div>
                  <div className="text-sm text-green-500">Concluída</div>
                </div>
              </div>
              
              <Button onClick={handleNextStep} size="lg" className="w-full">
                <ArrowRight className="w-4 h-4 mr-2" />
                Finalizar Jornada
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{jornada.aula_titulo}</h1>
              <p className="text-muted-foreground">
                {jornada.materia} • Prof. {jornada.professor_nome}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Etapa {currentStep} de 6
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={(currentStep / 6) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step) => (
                <div 
                  key={step.id} 
                  className={`text-center ${currentStep >= step.id ? 'text-primary' : ''}`}
                >
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                    currentStep >= step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                  <div className="hidden sm:block">{step.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Step Content */}
        {getCurrentStepContent()}
      </div>
    </div>
  );
};

export default StudentJourney;