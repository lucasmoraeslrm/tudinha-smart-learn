import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  Save
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

export default function StudentRedacao() {
  const { studentSession } = useAuth();
  const { toast } = useToast();
  
  const [temas, setTemas] = useState<Tema[]>([]);
  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [temaSelecionado, setTemaSelecionado] = useState<string>('');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'write' | 'history'>('home');
  const [currentTime, setCurrentTime] = useState(0);
  const [generatingTheme, setGeneratingTheme] = useState(false);
  const [showRedacaoModelo, setShowRedacaoModelo] = useState(false);
  const [redacaoModelo, setRedacaoModelo] = useState('');

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
      const { data, error } = await supabase
        .from('redacoes_usuario')
        .select(`
          *,
          temas_redacao:tema_id (
            titulo,
            texto_motivador
          )
        `)
        .eq('user_id', studentSession?.id || (localStorage.getItem('student_session') && JSON.parse(localStorage.getItem('student_session') || '{}').id))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar redações:', error);
    }
  };

  const iniciarRedacao = async (tipo: 'historico' | 'autoral' = 'historico') => {
    if (tipo === 'autoral') {
      await gerarTemaAutoral();
      return;
    }
    
    setCurrentView('write');
    // Don't start timer here - it will start when user begins typing
    setConteudo('');
    setTitulo('');
    setStartTime(null);
    setCurrentTime(0);
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
    if (!temaSelecionado || !titulo.trim() || !conteudo.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o conteudo da redação",
        variant: "destructive",
      });
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

    try {
      const tempoMs = startTime ? Date.now() - startTime.getTime() : 0;
      const studentData = JSON.parse(localStorage.getItem('student_session') || '{}');

      const { data, error } = await supabase
        .from('redacoes_usuario')
        .insert({
          user_id: studentSession?.id || studentData.id,
          student_id: studentData.id,
          escola_id: studentData.escola_id,
          tema_id: temaSelecionado,
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          palavras: wordCount,
          tempo_ms: tempoMs,
          status: 'enviada'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Redação enviada!",
        description: "Sua redação foi enviada e será corrigida em breve",
      });

      // Reset form
      setTitulo('');
      setConteudo('');
      setTemaSelecionado('');
      setStartTime(null);
      setCurrentTime(0);
      setCurrentView('home');
      
      // Reload essays
      loadRedacoes();

    } catch (error: any) {
      console.error('Erro ao salvar redação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar redação",
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

  // Home View
  if (currentView === 'home') {
    return (
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

            <Card className="opacity-50 cursor-not-allowed">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Corrigir Redação</h3>
                  <p className="text-sm text-muted-foreground">
                    Temporariamente desabilitado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
                <Button className="w-full" disabled>
                  Iniciar
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
                  <span className="text-sm font-mono">0/300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo ideal</span>
                  <span className="text-sm font-mono">0:00/90:00</span>
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
    );
  }

  // Write View
  if (currentView === 'write') {
    return (
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
              <p className="text-sm text-muted-foreground">Pratique e aprimore suas habilidades de escrita</p>
            </div>
          </div>

          {!selectedTema && (
            <Card>
              <CardContent className="p-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Escolha um tema:</label>
                  <Select value={temaSelecionado} onValueChange={setTemaSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tema" />
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
              </CardContent>
            </Card>
          )}

          {selectedTema && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">ENEM</Badge>
                  <Badge variant="secondary">médio</Badge>
                </div>
                <h2 className="text-lg font-semibold mb-4">{selectedTema.titulo}</h2>
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">
                  {selectedTema.texto_motivador}
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Textos de apoio:</h4>
                  <p className="text-xs text-muted-foreground">
                    Com base na leitura dos textos motivadores seguintes e nos conhecimentos construídos ao longo de sua formação, redija texto 
                    dissertativo-argumentativo em modalidade escrita formal da Língua Portuguesa sobre o tema apresentado, apresentando proposta de intervenção que 
                    respeite os direitos humanos. Selecione, organize e relacione, de forma coerente e coesa, argumentos e fatos para 
                    defesa de seu ponto de vista.
                  </p>
                  <div className="mt-3 pt-3 border-t">
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
                  className="min-h-[400px] text-base leading-relaxed"
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
    );
  }

  // History View
  if (currentView === 'history') {
    return (
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
                <Button className="w-full" disabled>
                  Iniciar
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
                  <span className="text-sm font-mono">0/300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tempo ideal</span>
                  <span className="text-sm font-mono">0:00/90:00</span>
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
    );
  }

  // Redação Modelo Modal
  if (showRedacaoModelo) {
    return (
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
    );
  }

  return null;
}