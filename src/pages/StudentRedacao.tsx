import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  Target, 
  BookOpen,
  Settings,
  Clock, 
  Send,
  ArrowLeft,
  Loader2,
  Star,
  CheckCircle,
  Save,
  X
} from 'lucide-react';

interface Tema {
  id: string;
  titulo: string;
  texto_motivador: string;
  ativo: boolean;
}

interface Redacao {
  id: string;
  titulo: string;
  conteudo: string;
  palavras: number;
  tempo_ms: number;
  status: string;
  created_at: string;
  notas?: any;
  feedback?: any;
  user_id?: string;
  temas_redacao?: {
    titulo: string;
    texto_motivador: string;
  };
}

interface TemaEnemHistorico {
  id: string;
  ano: number;
  titulo: string;
  categoria_tematica: string | null;
  dificuldade: string;
  palavras_chave: string[];
  textos_auxiliares_count: number;
  created_at: string;
}

export default function StudentRedacao() {
  const { studentSession } = useAuth();
  const { toast } = useToast();
  
  const [temas, setTemas] = useState<Tema[]>([]);
  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [temasEnemHistorico, setTemasEnemHistorico] = useState<TemaEnemHistorico[]>([]);
  const [temaSelecionado, setTemaSelecionado] = useState<string>('');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'write' | 'history' | 'enem-historico' | 'feedback'>('home');
  const [currentTime, setCurrentTime] = useState(0);
  const [generatingTheme, setGeneratingTheme] = useState(false);
  const [showRedacaoModelo, setShowRedacaoModelo] = useState(false);
  const [redacaoModelo, setRedacaoModelo] = useState('');
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ENEM');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionResult, setCorrectionResult] = useState<any>(null);
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    if (studentSession) {
      loadTemas();
      loadRedacoes();
    }
  }, [studentSession]);

  useEffect(() => {
    const words = conteudo.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(conteudo.trim() ? words : 0);
  }, [conteudo]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime]);

  const loadTemas = async () => {
    try {
      const { data, error } = await supabase
        .from('temas_redacao')
        .select('*')
        .eq('ativo', true)
        .eq('publica', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemas(data || []);
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os temas",
        variant: "destructive",
      });
    }
  };

  const loadRedacoes = async () => {
    try {
      const studentId = studentSession?.id || (localStorage.getItem('student_session') && JSON.parse(localStorage.getItem('student_session') || '{}').id);
      if (!studentId) {
        setRedacoes([]);
        return;
      }

      const { data, error } = await supabase
        .from('redacoes_usuario')
        .select(`
          *,
          temas_redacao:tema_id (
            titulo,
            texto_motivador
          )
        `)
        .or(`student_id.eq.${studentId},user_id.eq.${studentId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar redações:', error);
    }
  };

  const loadTemasEnemHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('temas_enem_historico')
        .select('*')
        .order('ano', { ascending: false });

      if (error) throw error;
      setTemasEnemHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar temas do ENEM histórico:', error);
    }
  };

  const iniciarRedacao = async (tipo: 'historico' | 'autoral' = 'historico') => {
    if (tipo === 'autoral') {
      await gerarTemaAutoral();
      return;
    }
    
    if (tipo === 'historico') {
      setShowHistoricoModal(true);
      return;
    }
    
    setCurrentView('write');
    // Don't start timer here - it will start when user begins typing
    setConteudo('');
    setTitulo('');
    setStartTime(null);
    setCurrentTime(0);
  };

  const handleHistoricoSelection = async () => {
    if (!selectedYear) {
      toast({
        title: "Seleção obrigatória",
        description: "Selecione um ano para continuar",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setShowHistoricoModal(false);
    
    try {
      // Load historical themes for the selected year
      const { data, error } = await supabase
        .from('temas_enem_historico')
        .select('*')
        .eq('ano', parseInt(selectedYear))
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "Nenhum tema encontrado",
          description: "Não há temas disponíveis para o ano selecionado",
          variant: "destructive",
        });
        return;
      }

      // Select a random theme from the year
      const randomTheme = data[Math.floor(Math.random() * data.length)];
      
      // Create a tema object compatible with the existing system
      const temaAdaptado: Tema = {
        id: randomTheme.id,
        titulo: randomTheme.titulo,
        texto_motivador: `Tema do ENEM ${randomTheme.ano}\n\nPalavras-chave: ${randomTheme.palavras_chave.join(', ')}\n\nDificuldade: ${randomTheme.dificuldade}`,
        ativo: true
      };
      
      // Add the theme to the current themes list if not already there
      setTemas(currentTemas => {
        const exists = currentTemas.find(t => t.id === temaAdaptado.id);
        if (!exists) {
          return [temaAdaptado, ...currentTemas];
        }
        return currentTemas;
      });
      
      // Set the selected theme and go to writing view
      setTemaSelecionado(randomTheme.id);
      setCurrentView('write');
      setConteudo('');
      setTitulo('');
      setStartTime(null);
      setCurrentTime(0);
      
      toast({
        title: "Tema selecionado!",
        description: `Tema do ENEM ${randomTheme.ano} carregado com sucesso`,
      });
      
    } catch (error) {
      console.error('Erro ao carregar tema histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o tema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableYears = () => {
    const years = [];
    for (let year = 2023; year >= 2014; year--) {
      years.push(year.toString());
    }
    return years;
  };

  const gerarTemaAutoral = async () => {
    if (!studentSession) return;
    
    setGeneratingTheme(true);
    try {
      const studentData = JSON.parse(localStorage.getItem('student_session') || '{}');
      
      const { data, error } = await supabase.functions.invoke('gerar-tema-webhook', {
        body: {
          dificuldade: 'medio',
          categoria_tematica: null
        },
        headers: {
          'X-Student-Session': JSON.stringify(studentData)
        }
      });

      if (error) throw error;

      // Set the generated theme as selected
      const newTheme = data.theme;
      setTemaSelecionado(newTheme.id);
      
      // Reload themes to include the new one
      await loadTemas();
      
      // Start writing with the new theme
      setCurrentView('write');
      // Don't start timer here - it will start when user begins typing
      setConteudo('');
      setTitulo('');
      setStartTime(null);
      setCurrentTime(0);

      toast({
        title: 'Tema gerado com sucesso!',
        description: 'Um novo tema foi criado e já está selecionado para você começar a escrever.',
      });

    } catch (error: any) {
      console.error('Erro ao gerar tema autoral:', error);
      toast({
        title: 'Erro ao gerar tema',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingTheme(false);
    }
  };

  const salvarRedacao = async () => {
    if (!temaSelecionado || !conteudo.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tema e preencha o conteúdo da redação",
        variant: "destructive",
      });
      
      if (!conteudo.trim()) {
        const textarea = document.querySelector('textarea[placeholder="Digite sua redação aqui..."]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }
      return;
    }

    if (wordCount < 5) {
      toast({
        title: "Redação muito curta",
        description: "Sua redação deve ter pelo menos 5 palavras",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setShowCorrectionModal(true);
    setCorrecting(true);

    try {
      const tempoMs = startTime ? Date.now() - startTime.getTime() : 0;
      const studentData = JSON.parse(localStorage.getItem('student_session') || '{}');

      // First, save the essay via Edge Function (bypasses RLS with validation)
      const { data: saveResponse, error: saveError } = await supabase.functions.invoke('salvar-redacao', {
        body: {
          tema_id: temaSelecionado,
          titulo: titulo.trim() || null,
          conteudo: conteudo.trim(),
          palavras: wordCount,
          tempo_ms: tempoMs,
        },
        headers: {
          'X-Student-Session': JSON.stringify(studentData),
        },
      });

      if (saveError) throw saveError;
      const savedEssay = saveResponse?.essay;

      // Get full theme data for webhook
      const { data: temaData, error: temaError } = await supabase
        .from('temas_redacao')
        .select('*')
        .eq('id', temaSelecionado)
        .maybeSingle();

      if (temaError) {
        console.warn('Tema não encontrado em temas_redacao, usando fallback do estado.');
      }

      const temaInfo = temaData || temas.find(t => t.id === temaSelecionado);

      // Prepare webhook payload according to specification
      const webhookPayload = {
        redacao_id: savedEssay.id,
        user_id: studentSession?.id || studentData.id,
        tema: {
          titulo: temaInfo?.titulo || 'Tema',
          descricao: temaInfo?.texto_motivador || '',
          instrucoes_oficiais: "Redação dissertativo-argumentativa com base nos textos motivadores",
          textos_auxiliares: temaInfo?.texto_motivador ? [temaInfo.texto_motivador] : [],
          palavras_chave: Array.isArray((temaData as any)?.competencias) ? (temaData as any).competencias : [],
          categoria_tematica: "geral", 
          dificuldade: "media",
          tipo_vestibular: "enem"
        },
        conteudo: conteudo.trim(),
        tempo_gasto: Math.floor(tempoMs / 1000), // Convert to seconds
        ...(titulo.trim() && { titulo: titulo.trim() })
      };

      console.log('Sending to webhook:', webhookPayload);

      // Send to N8N webhook via send-n8n-webhook edge function
      const { data: correctionData, error: correctionError } = await supabase.functions.invoke('send-n8n-webhook', {
        body: {
          webhookUrl: 'https://n8n.srv863581.hstgr.cloud/webhook/65a1a27c-3c01-438a-8518-ae3a5103f204',
          webhookData: webhookPayload
        }
      });

      console.log('Webhook response:', correctionData);
      console.log('Webhook error:', correctionError);

      if (correctionError) {
        console.error('Webhook error details:', correctionError);
        throw correctionError;
      }

      // Ensure correctionData has the right structure
      const processedResult = correctionData || {
        comentario_geral: "Correção processada com sucesso.",
        feedback_geral: "Sua redação foi analisada com sucesso.",
        nota_final: 0,
        competencias: {}
      };

      console.log('Setting correction result:', processedResult);
      
      // Save correction to database
      const { data: redacaoAtualizada, error: updateError } = await supabase
        .from('redacoes_usuario')
        .update({
          status: 'corrigida',
          correcao_ia: processedResult,
          data_correcao: new Date().toISOString()
        })
        .eq('id', savedEssay.id)
        .select(`
          *,
          temas_redacao(*)
        `)
        .single();

      if (updateError) {
        console.error('Erro ao salvar correção:', updateError);
        throw new Error('Erro ao salvar correção no banco de dados');
      }

      console.log('Correção salva no banco:', redacaoAtualizada);
      setCorrectionResult(processedResult);
      setCorrecting(false);
      
      // Wait a moment to show success, then navigate to feedback
      setTimeout(() => {
        setShowCorrectionModal(false);
        setCurrentView('feedback');
        
        // Reset form
        setTitulo('');
        setConteudo('');
        setTemaSelecionado('');
        setStartTime(null);
        setCurrentTime(0);
        
        // Reload essays
        loadRedacoes();
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao salvar/corrigir redação:', error);
      setCorrecting(false);
      setShowCorrectionModal(false);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar redação",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const solicitarCorrecao = async (redacaoId: string) => {
    setLoading(true);
    
    try {
      const studentData = JSON.parse(localStorage.getItem('studentSession') || '{}');
      
      const { data, error } = await supabase.functions.invoke('enem-corrigir', {
        body: { 
          redacao_id: redacaoId, 
          escola_id: studentData.escola_id 
        },
        headers: {
          'X-Student-Session': JSON.stringify(studentData)
        }
      });

      if (error) throw error;

      toast({
        title: "Correção solicitada!",
        description: "Sua redação está sendo corrigida pela IA",
      });

      loadRedacoes();
    } catch (error: any) {
      console.error('Erro na correção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar correção",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada': return 'default';
      case 'corrigindo': return 'secondary';
      case 'corrigida': return 'destructive';
      default: return 'outline';
    }
  };

  const getNotaFinal = (redacao: Redacao) => {
    return redacao.feedback?.nota_final || 0;
  };

  const selectedTema = temas.find(t => t.id === temaSelecionado);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeTarget = (minutes: number) => {
    return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
  };

  const gerarNovoTema = async () => {
    if (!studentSession) return;
    
    setGeneratingTheme(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-tema', {
        body: {
          dificuldade: 'medio',
          categoria_tematica: null
        }
      });

      if (error) throw error;

      toast({
        title: 'Tema gerado com sucesso!',
        description: 'Um novo tema foi criado e já está disponível.',
      });

      loadTemas(); // Recarrega a lista de temas
    } catch (error: any) {
      console.error('Erro ao gerar tema:', error);
      toast({
        title: 'Erro ao gerar tema',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingTheme(false);
    }
  };

  const gerarRedacaoModelo = async (temaId: string) => {
    if (!studentSession) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gerar-redacao-modelo', {
        body: { tema_id: temaId }
      });

      if (error) throw error;

      setRedacaoModelo(data.redacao_modelo);
      setShowRedacaoModelo(true);
    } catch (error: any) {
      console.error('Erro ao gerar redação-modelo:', error);
      toast({
        title: 'Erro ao gerar exemplo',
        description: error.message || 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Modal de Seleção ENEM Histórico
  const HistoricoModal = (
    <Dialog open={showHistoricoModal} onOpenChange={setShowHistoricoModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Selecionar Tema Histórico
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistoricoModal(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vestibular</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o vestibular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENEM">ENEM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ano</label>
            <Select value={selectedYear || ""} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableYears().map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowHistoricoModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleHistoricoSelection}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Selecionar Tema
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Modal de Correção
  const CorrectionModal = (
    <Dialog open={showCorrectionModal} onOpenChange={() => {}} >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            {correcting ? 'Corrigindo sua redação...' : 'Correção concluída!'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center py-6">
          {correcting ? (
            <>
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Aguarde um momento...</p>
                <p className="text-sm text-muted-foreground">
                  Nossa IA está analisando sua redação e gerando o feedback detalhado.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">Correção concluída!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para o resultado...
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Home View
  if (currentView === 'home') {
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Redação ENEM</h1>
                <p className="text-muted-foreground">Pratique e aprimore suas habilidades de escrita</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={gerarNovoTema}
                  disabled={generatingTheme}
                >
                  {generatingTheme ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  {generatingTheme ? 'Gerando...' : 'Novo Tema'}
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Dicas
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => iniciarRedacao('historico')}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">ENEM Histórico</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Pratique com temas oficiais do ENEM (2014-2023)
                    </p>
                    <Badge variant="secondary">Autêntico</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer hover:shadow-lg transition-shadow group ${generatingTheme ? 'opacity-50' : ''}`} onClick={() => !generatingTheme && iniciarRedacao('autoral')}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    {generatingTheme ? (
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    ) : (
                      <Target className="w-8 h-8 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Tema Autoral</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {generatingTheme ? 'Gerando tema...' : 'Gere um tema inédito com IA no padrão ENEM'}
                    </p>
                    <Badge variant="secondary">
                      {generatingTheme ? 'Aguarde' : 'Desafio'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => setCurrentView('history')}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Minhas Redações</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize todas as suas redações anteriores
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Configurações</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajuste suas preferências de redação
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Write View
  if (currentView === 'write') {
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Redação ENEM</h1>
                <p className="text-sm text-muted-foreground">Desenvolva sua redação</p>
              </div>
            </div>
          
            <div>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da Redação (opcional)"
                className="text-lg font-medium mb-4"
                maxLength={100}
              />
            </div>

            {!selectedTema && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Selecione um tema</label>
                      <Select value={temaSelecionado} onValueChange={setTemaSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha um tema para sua redação" />
                        </SelectTrigger>
                        <SelectContent>
                          {temas.map((tema) => (
                            <SelectItem key={tema.id} value={tema.id}>
                              {tema.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTema && (
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">ENEM</Badge>
                        <Badge variant="secondary">medio</Badge>
                      </div>
                      <h2 className="text-lg font-semibold mb-3">{selectedTema.titulo}</h2>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => gerarRedacaoModelo(selectedTema.id)}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                      {loading ? 'Gerando...' : 'Ver Exemplo'}
                    </Button>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {selectedTema.texto_motivador}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto dissertativo-argumentativo em modalidade escrita formal da língua portuguesa sobre o tema apresentado, apresentando proposta de intervenção, que respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para defesa de seu ponto de vista.
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Textos de apoio:</p>
                    <div className="bg-muted/20 p-3 rounded text-xs text-muted-foreground">
                      [Os textos motivadores seriam exibidos aqui]
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedTema && (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Redação</label>
                  {wordCount > 0 && (
                    <div className="text-right text-sm text-muted-foreground mb-2">
                      {wordCount} palavras
                    </div>
                  )}
                  <Textarea
                    value={conteudo}
                    onChange={(e) => {
                      setConteudo(e.target.value);
                      // Start timer on first character typed
                      if (!startTime && e.target.value.trim().length > 0) {
                        setStartTime(new Date());
                      }
                      // Reset timer if content is cleared
                      if (e.target.value.trim().length === 0) {
                        setStartTime(null);
                        setCurrentTime(0);
                      }
                    }}
                    placeholder="Comece a escrever sua redação aqui... (mínimo 200 palavras)"
                    className="min-h-[400px] text-base leading-relaxed bg-white"
                    maxLength={5000}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => {
                      toast({
                        title: "Rascunho salvo",
                        description: "Sua redação foi salva como rascunho",
                      });
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </Button>
                  <Button 
                    onClick={salvarRedacao} 
                    disabled={submitting || wordCount < 5}
                    className="flex items-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Finalizar e Corrigir
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Cronômetro
                  </h3>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-mono font-bold text-primary">
                    {formatTime(currentTime)}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      if (!startTime) {
                        setStartTime(new Date());
                      }
                    }}
                    disabled={!!startTime}
                  >
                    {startTime ? 'Em andamento' : 'Iniciar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Metas de Redação
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Palavras</span>
                    <span className="text-sm font-mono">{wordCount}/300</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo ideal</span>
                    <span className="text-sm font-mono">{formatTime(currentTime)}/90:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Estrutura Ideal</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Introdução (20-25 linhas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Desenvolvimento 1 (35-40 linhas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Desenvolvimento 2 (35-40 linhas)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Conclusão (25-30 linhas)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // History View
  if (currentView === 'history') {
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Minhas Redações</h1>
                <p className="text-sm text-muted-foreground">Visualize o histórico das suas redações</p>
              </div>
            </div>

            {redacoes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-20">
                  <BookOpen className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-3">Nenhuma redação encontrada</h3>
                  <p className="text-muted-foreground mb-6">
                    Você ainda não escreveu nenhuma redação. Que tal começar agora?
                  </p>
                  <Button onClick={() => setCurrentView('home')}>
                    Escrever Primeira Redação
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {redacoes.map((redacao) => (
                  <Card key={redacao.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{redacao.titulo}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Tema: {redacao.temas_redacao?.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(redacao.created_at).toLocaleString()} • {redacao.palavras} palavras
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {redacao.status === 'corrigida' && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Star className="w-3 h-3 mr-1" />
                              {getNotaFinal(redacao)}/1000
                            </Badge>
                          )}
                          <Badge variant={getStatusColor(redacao.status)}>
                            {redacao.status === 'enviada' && <Clock className="w-3 h-3 mr-1" />}
                            {redacao.status === 'corrigida' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {redacao.status.charAt(0).toUpperCase() + redacao.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {redacao.conteudo.substring(0, 200)}...
                      </p>
                      
                      {redacao.status === 'enviada' && (
                        <Button 
                          onClick={() => solicitarCorrecao(redacao.id)}
                          disabled={loading}
                          variant="outline"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Solicitar Correção
                        </Button>
                      )}

                      {redacao.status === 'corrigida' && redacao.feedback && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">
                            Feedback da Correção
                          </h4>
                          <p className="text-sm text-green-700">
                            {redacao.feedback.feedback_geral}
                          </p>
                          {redacao.notas && (
                            <div className="mt-3 grid grid-cols-5 gap-2">
                              {Object.entries(redacao.notas).map(([comp, dados]: [string, any]) => (
                                <div key={comp} className="text-center">
                                  <div className="text-xs text-green-600 font-medium">
                                    {comp.replace('competencia_', 'C')}
                                  </div>
                                  <div className="text-sm font-bold text-green-800">
                                    {dados.nota}/200
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ENEM Histórico View
  if (currentView === 'enem-historico') {
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">ENEM Histórico</h1>
                <p className="text-sm text-muted-foreground">
                  Escolha um tema oficial do ENEM para praticar
                  {selectedYear && ` - Ano: ${selectedYear}`}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {temasEnemHistorico
                .filter(tema => !selectedYear || tema.ano.toString() === selectedYear)
                .map((tema) => (
                <Card 
                  key={tema.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow group border-l-4 border-l-primary"
                  onClick={() => {
                    // Simular um tema da estrutura atual para compatibilidade
                    const temaCompativel = {
                      id: tema.id,
                      titulo: tema.titulo,
                      texto_motivador: `Tema oficial do ENEM ${tema.ano}\n\nPalavras-chave: ${tema.palavras_chave.join(', ')}\n\nEste é um tema oficial do ENEM. Desenvolva sua redação dissertativo-argumentativa sobre o assunto proposto.`,
                      ativo: true
                    };
                    
                    setTemas([temaCompativel]);
                    setTemaSelecionado(tema.id);
                    setCurrentView('write');
                    setConteudo('');
                    setTitulo('');
                    setStartTime(null);
                    setCurrentTime(0);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{tema.ano}</Badge>
                          <Badge variant="secondary" className={
                            tema.dificuldade === 'facil' ? 'bg-green-100 text-green-800' :
                            tema.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {tema.dificuldade === 'facil' ? 'Fácil' : 
                             tema.dificuldade === 'medio' ? 'Médio' : 'Difícil'}
                          </Badge>
                          {tema.categoria_tematica && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {tema.categoria_tematica.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                          {tema.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {tema.palavras_chave.slice(0, 4).map((palavra, index) => (
                            <span 
                              key={index}
                              className="inline-block bg-muted px-2 py-1 rounded-sm text-xs text-muted-foreground"
                            >
                              {palavra}
                            </span>
                          ))}
                          {tema.palavras_chave.length > 4 && (
                            <span className="inline-block bg-muted px-2 py-1 rounded-sm text-xs text-muted-foreground">
                              +{tema.palavras_chave.length - 4} mais
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tema.textos_auxiliares_count} textos motivadores • Tema oficial ENEM {tema.ano}
                        </p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {temasEnemHistorico.length === 0 && (
              <Card>
                <CardContent className="text-center py-20">
                  <Calendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-3">Carregando temas históricos...</h3>
                  <p className="text-muted-foreground">
                    Aguarde enquanto carregamos os temas oficiais do ENEM.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  }

  // Feedback View  
  if (currentView === 'feedback') {
    console.log('Rendering feedback view with correctionResult:', correctionResult);
    
    // If no correctionResult, create a default one from the latest essay
    const feedbackData = correctionResult || {
      comentario_geral: "Sua redação foi salva com sucesso e está sendo processada.",
      feedback_geral: "O feedback detalhado será disponibilizado em breve.",
      nota_final: 0,
      competencias: {}
    };
    
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Resultado da Correção</h1>
                <p className="text-sm text-muted-foreground">Feedback detalhado da sua redação</p>
              </div>
            </div>

            {/* Nota Final */}
            <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Nota Final</h3>
                    <p className="text-sm text-muted-foreground">Sua pontuação no ENEM</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">
                      {feedbackData.nota_final || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">de 1000 pontos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Comentário Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {feedbackData.comentario_geral || feedbackData.feedback_geral || 'Feedback não disponível'}
                </p>
              </CardContent>
            </Card>

            {/* Competências */}
            {feedbackData.competencias && Object.keys(feedbackData.competencias).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Avaliação por Competências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(feedbackData.competencias).map(([key, comp]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            Competência {key.replace('competencia_', '')} - {comp.titulo || getCompetenciaTitle(key)}
                          </h4>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {comp.nota || 0}/200
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {getCompetenciaDescription(key)}
                        </p>
                        <div className="bg-muted/30 p-3 rounded text-sm">
                          {comp.feedback || comp.comentario || 'Sem feedback específico'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botão para nova redação */}
            <div className="flex gap-2">
              <Button onClick={() => setCurrentView('home')} className="flex-1">
                Escrever Nova Redação
              </Button>
              <Button variant="outline" onClick={() => setCurrentView('history')}>
                Ver Histórico
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Redação Modelo Modal
  if (showRedacaoModelo) {
    return (
      <>
        {HistoricoModal}
        {CorrectionModal}
        <div className="flex flex-1 gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowRedacaoModelo(false);
                  setRedacaoModelo('');
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Redação Modelo</h1>
                <p className="text-sm text-muted-foreground">Exemplo de redação para o tema selecionado</p>
              </div>
            </div>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">EXEMPLO</Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Modelo</Badge>
                </div>
                <h2 className="text-lg font-semibold mb-4">{selectedTema?.titulo}</h2>
                <div className="prose prose-sm max-w-none">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="whitespace-pre-line leading-relaxed">
                      {redacaoModelo}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-l-blue-500">
                  <h4 className="font-medium text-sm text-blue-800 mb-2">💡 Dica</h4>
                  <p className="text-xs text-blue-700">
                    Esta é uma redação-modelo gerada automaticamente. Use-a como inspiração para estrutura e 
                    argumentação, mas desenvolva suas próprias ideias e repertórios na sua redação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  // Helper functions for competencies
  const getCompetenciaTitle = (key: string) => {
    const titles = {
      competencia_1: "Domínio da norma culta",
      competencia_2: "Compreensão da proposta",
      competencia_3: "Argumentação e dados",
      competencia_4: "Coesão e coerência",
      competencia_5: "Proposta de intervenção"
    };
    return titles[key as keyof typeof titles] || "Competência";
  };

  const getCompetenciaDescription = (key: string) => {
    const descriptions = {
      competencia_1: "Avalia o domínio da modalidade escrita formal da língua portuguesa",
      competencia_2: "Avalia a compreensão da proposta de redação e aplicação de conceitos",
      competencia_3: "Avalia a capacidade de argumentação com dados, informações e conhecimentos",
      competencia_4: "Avalia os mecanismos linguísticos para construção da argumentação",
      competencia_5: "Avalia a proposta de intervenção para o problema abordado"
    };
    return descriptions[key as keyof typeof descriptions] || "";
  };

  return (
    <>
      {HistoricoModal}
      {CorrectionModal}
      <div>Página não encontrada</div>
    </>
  );
}