import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Send, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemaRedacao {
  id: string;
  titulo: string;
  texto_motivador: string;
  competencias: any;
}

interface RedacaoEditorProps {
  tema: TemaRedacao;
  onBack: () => void;
  redacaoId?: string;
}

export default function RedacaoEditor({ tema, onBack, redacaoId }: RedacaoEditorProps) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startTime] = useState(Date.now());
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (redacaoId) {
      loadRedacao();
    }
  }, [redacaoId]);

  const loadRedacao = async () => {
    if (!redacaoId || !user) return;

    try {
      const { data, error } = await supabase
        .from('redacoes_usuario')
        .select('*')
        .eq('id', redacaoId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setTitulo(data.titulo || '');
        setConteudo(data.conteudo || '');
      }
    } catch (error) {
      console.error('Error loading composition:', error);
      toast({
        title: "Erro ao carregar redação",
        description: "Não foi possível carregar a redação.",
        variant: "destructive"
      });
    }
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getTimeSpent = (): number => {
    return Date.now() - startTime;
  };

  const saveRedacao = async (status: 'rascunho' | 'enviada') => {
    if (!user || !conteudo.trim()) return;

    setSaving(true);
    try {
      const redacaoData = {
        user_id: user.id,
        escola_id: profile?.escola_id || null,
        tema_id: tema.id,
        titulo: titulo.trim() || null,
        conteudo: conteudo.trim(),
        palavras: countWords(conteudo),
        tempo_ms: getTimeSpent(),
        status
      };

      let result;
      if (redacaoId) {
        result = await supabase
          .from('redacoes_usuario')
          .update(redacaoData)
          .eq('id', redacaoId)
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('redacoes_usuario')
          .insert([redacaoData]);
      }

      if (result.error) throw result.error;

      toast({
        title: status === 'rascunho' ? "Rascunho salvo!" : "Redação enviada!",
        description: status === 'rascunho' 
          ? "Sua redação foi salva como rascunho."
          : "Sua redação foi enviada para avaliação."
      });

      if (status === 'enviada') {
        onBack();
      }
    } catch (error) {
      console.error('Error saving composition:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a redação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const wordCount = countWords(conteudo);
  const timeSpent = Math.floor(getTimeSpent() / 1000 / 60); // in minutes

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tema.titulo}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {timeSpent}min
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instruções do Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tema.texto_motivador && (
                <div>
                  <h4 className="font-medium mb-2">Texto Motivador:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tema.texto_motivador}
                  </p>
                </div>
              )}
              
              {tema.competencias && Array.isArray(tema.competencias) && tema.competencias.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Competências:</h4>
                  <div className="flex flex-wrap gap-1">
                    {tema.competencias.map((comp: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Estatísticas</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Palavras: {wordCount}</p>
                  <p>Tempo: {timeSpent} minutos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sua Redação</CardTitle>
              <CardDescription>
                Escreva sua redação abaixo. Lembre-se de seguir a estrutura padrão: introdução, desenvolvimento e conclusão.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium mb-2">
                  Título (opcional)
                </label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Digite um título para sua redação..."
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="conteudo" className="block text-sm font-medium mb-2">
                  Texto da redação *
                </label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Digite sua redação aqui..."
                  className="min-h-[400px] resize-none"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  {wordCount === 0 ? 'Digite algo para começar...' : 
                   `${wordCount} palavra${wordCount !== 1 ? 's' : ''}`}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => saveRedacao('rascunho')}
                    disabled={saving || !conteudo.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Rascunho'}
                  </Button>
                  
                  <Button
                    onClick={() => saveRedacao('enviada')}
                    disabled={saving || !conteudo.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {saving ? 'Enviando...' : 'Enviar Redação'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}