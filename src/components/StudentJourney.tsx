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
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentJourneyProps {
  jornada: any;
  onComplete: () => void;
}

const StudentJourney: React.FC<StudentJourneyProps> = ({ jornada, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [resumoInicial, setResumoInicial] = useState('');
  const [tempoResumo, setTempoResumo] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [exercicioUrl, setExercicioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTempoResumo(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

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

      // Gerar mensagem personalizada via IA (simulado)
      const mensagemIA = `Olá! Bem-vindo à aula de ${jornada.materia}! Hoje vamos estudar sobre ${jornada.assunto} com o professor ${jornada.professor_nome}. 

Esta será uma jornada interativa onde você poderá aprender de forma personalizada. Estou aqui para te ajudar em cada etapa!

Você está pronto para começar?`;

      setAiMessage(mensagemIA);
      
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

  const handleNextStep = async () => {
    if (currentStep === 2) {
      // Validar resumo inicial
      if (!resumoInicial.trim()) {
        toast({
          title: "Resumo necessário",
          description: "Por favor, escreva um resumo sobre o que você sabe do assunto",
          variant: "destructive",
        });
        return;
      }

      // Parar timer
      setIsTimerRunning(false);

      // Salvar resumo inicial
      await supabase
        .from('jornadas')
        .update({ 
          resumo_inicial: resumoInicial,
          tempo_resumo_segundos: tempoResumo
        })
        .eq('id', jornada.id);

      // Se passou de 5 minutos, alertar professor
      if (tempoResumo > 300) {
        await supabase
          .from('jornadas')
          .update({ status: 'aguardando_liberacao' })
          .eq('id', jornada.id);
        
        toast({
          title: "Aguardando liberação",
          description: "O professor foi avisado. Aguarde a liberação para continuar.",
          variant: "destructive",
        });
        return;
      }

      // Gerar explicação da IA baseada no resumo
      const explicacaoIA = `Muito bem! Com base no que você compartilhou sobre ${jornada.assunto}, vou explicar os conceitos principais:

${jornada.assunto === 'Leis de Newton' ? 
  `As Leis de Newton são três princípios fundamentais da mecânica clássica:
  
  1ª Lei (Inércia): Um corpo em repouso tende a permanecer em repouso, e um corpo em movimento tende a continuar em movimento retilíneo uniforme, a menos que uma força externa atue sobre ele.
  
  2ª Lei (F = ma): A aceleração de um objeto é diretamente proporcional à força resultante aplicada e inversamente proporcional à sua massa.
  
  3ª Lei (Ação e Reação): Para toda ação existe uma reação igual e oposta.` :
  
  `Vou explicar os conceitos principais de ${jornada.assunto} de forma clara e didática, relacionando com exemplos práticos do seu dia a dia.`
}

Agora você pode fazer perguntas sobre qualquer parte que não entendeu!`;

      setAiMessage(explicacaoIA);
    }

    if (currentStep === 4) {
      // Buscar exercícios relacionados ao assunto
      const { data: exercicios } = await supabase
        .from('exercises')
        .select('*')
        .eq('subject', jornada.materia)
        .limit(6);

      if (exercicios && exercicios.length >= 6) {
        // Separar por dificuldade: 2 fáceis, 2 médios, 2 difíceis
        const faceis = exercicios.filter(e => e.nivel_dificuldade === 'facil').slice(0, 2);
        const medios = exercicios.filter(e => e.nivel_dificuldade === 'medio').slice(0, 2);
        const dificeis = exercicios.filter(e => e.nivel_dificuldade === 'dificil').slice(0, 2);
        
        const exerciciosSelecionados = [...faceis, ...medios, ...dificeis];
        
        // Simular URL do exercício (depois implementar página real)
        setExercicioUrl(`/exercicio/${jornada.id}`);
      }
    }

    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
      
      // Iniciar timer no step 2
      if (currentStep === 1) {
        setIsTimerRunning(true);
      }
    } else {
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
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Mensagem da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {aiMessage}
              </div>
              <Button className="mt-4" onClick={handleNextStep}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Vamos começar!
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
              <CardDescription>
                Conte o que você já sabe sobre {jornada.assunto}. Você tem até 5 minutos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Escreva aqui o que você sabe sobre ${jornada.assunto}...`}
                value={resumoInicial}
                onChange={(e) => setResumoInicial(e.target.value)}
                rows={6}
              />
              <Button 
                onClick={handleNextStep} 
                disabled={!resumoInicial.trim()}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Resumo
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
              <div className="whitespace-pre-line text-sm leading-relaxed mb-4">
                {aiMessage}
              </div>
              <Button onClick={handleNextStep}>
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
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm mb-2">💡 Dica: Você pode perguntar sobre:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Conceitos que não ficaram claros</li>
                  <li>Exemplos práticos do assunto</li>
                  <li>Como aplicar na vida real</li>
                  <li>Curiosidades relacionadas</li>
                </ul>
              </div>
              
              <Textarea
                placeholder="Digite sua pergunta aqui..."
                rows={3}
              />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Fazer Pergunta
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
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Exercícios Práticos
              </CardTitle>
              <CardDescription>
                6 questões: 2 fáceis, 2 intermediárias, 2 difíceis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm mb-2">📋 Sobre os exercícios:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>6 questões de múltipla escolha</li>
                  <li>Tempo será contabilizado</li>
                  <li>Resultado imediato após envio</li>
                  <li>Explicações das respostas</li>
                </ul>
              </div>
              
              <Button onClick={handleNextStep} size="lg" className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Exercícios
              </Button>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Jornada Concluída!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Parabéns!</h3>
                <p className="text-muted-foreground">
                  Você completou com sucesso sua jornada de aprendizado sobre {jornada.assunto}
                </p>
              </div>
              
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
                {jornada.materia} • {jornada.assunto} • Prof. {jornada.professor_nome}
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