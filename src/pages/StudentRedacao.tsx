import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Star,
  BookOpen 
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
        .eq('user_id', studentSession?.id || localStorage.getItem('studentSession') && JSON.parse(localStorage.getItem('studentSession') || '{}').id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedacoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar redações:', error);
    }
  };

  const iniciarRedacao = () => {
    if (!temaSelecionado) {
      toast({
        title: "Selecione um tema",
        description: "Escolha um tema para começar sua redação",
        variant: "destructive",
      });
      return;
    }
    setStartTime(new Date());
    setConteudo('');
    setTitulo('');
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
      const studentData = JSON.parse(localStorage.getItem('studentSession') || '{}');

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Redações ENEM</h1>
          <p className="text-muted-foreground">Pratique e receba correções automáticas</p>
        </div>
      </div>

      <Tabs defaultValue="escrever" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="escrever">Escrever Redação</TabsTrigger>
          <TabsTrigger value="historico">Minhas Redações ({redacoes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="escrever" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Nova Redação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {selectedTema && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{selectedTema.titulo}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedTema.texto_motivador}
                    </p>
                  </CardContent>
                </Card>
              )}

              {startTime && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Tempo: {Math.floor((Date.now() - startTime.getTime()) / 60000)} min
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Palavras: {wordCount}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Título:</label>
                    <Textarea
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Digite o título da sua redação"
                      className="h-20"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Redação:</label>
                    <Textarea
                      value={conteudo}
                      onChange={(e) => setConteudo(e.target.value)}
                      placeholder="Escreva sua redação aqui..."
                      className="h-96"
                      maxLength={5000}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={salvarRedacao} 
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Enviar Redação
                    </Button>
                  </div>
                </div>
              )}

              {!startTime && selectedTema && (
                <Button onClick={iniciarRedacao} className="w-full">
                  Começar a Escrever
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          {redacoes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma redação ainda</h3>
                <p className="text-muted-foreground">
                  Comece escrevendo sua primeira redação na aba "Escrever Redação"
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}