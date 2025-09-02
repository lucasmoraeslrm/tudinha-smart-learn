import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenTool, FileText, Clock, Eye, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Redacao {
  id: string;
  titulo: string;
  conteudo: string;
  palavras: number;
  tempo_ms: number;
  status: string;
  notas: any;
  feedback: any;
  created_at: string;
  updated_at: string;
  tema_id: string;
  temas_redacao: {
    titulo: string;
  };
}

interface MinhasRedacoesProps {
  onEditRedacao: (redacaoId: string, tema: any) => void;
  onNewRedacao: () => void;
}

export default function MinhasRedacoes({ onEditRedacao, onNewRedacao }: MinhasRedacoesProps) {
  const [redacoes, setRedacoes] = useState<Redacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRedacoes();
    }
  }, [user]);

  const loadRedacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('redacoes_usuario')
        .select(`
          *,
          temas_redacao (
            titulo
          )
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRedacoes(data || []);
    } catch (error) {
      console.error('Error loading compositions:', error);
      toast({
        title: "Erro ao carregar redações",
        description: "Não foi possível carregar suas redações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRedacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta redação?')) return;

    try {
      const { error } = await supabase
        .from('redacoes_usuario')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setRedacoes(redacoes.filter(r => r.id !== id));
      toast({
        title: "Redação excluída",
        description: "A redação foi removida com sucesso."
      });
    } catch (error) {
      console.error('Error deleting composition:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a redação.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'enviada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'avaliada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'enviada': return 'Enviada';
      case 'avaliada': return 'Avaliada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 1000 / 60);
    return `${minutes}min`;
  };

  const filterByStatus = (status: string) => {
    return redacoes.filter(r => r.status === status);
  };

  const RedacaoCard = ({ redacao }: { redacao: Redacao }) => (
    <Card key={redacao.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {redacao.titulo || redacao.temas_redacao?.titulo || 'Redação sem título'}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(redacao.tempo_ms || 0)}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {redacao.palavras} palavras
              </div>
              <span className="text-xs">
                {formatDate(redacao.updated_at)}
              </span>
            </CardDescription>
          </div>
          <Badge className={getStatusColor(redacao.status)}>
            {getStatusText(redacao.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {redacao.conteudo.substring(0, 120)}
            {redacao.conteudo.length > 120 && '...'}
          </p>
          
          <div className="flex gap-2 ml-4">
            {redacao.status === 'rascunho' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditRedacao(redacao.id, { id: redacao.tema_id, titulo: redacao.temas_redacao?.titulo })}
              >
                <Edit2 className="w-3 h-3 mr-1" />
                Continuar
              </Button>
            )}
            
            {redacao.status !== 'rascunho' && (
              <Button size="sm" variant="outline">
                <Eye className="w-3 h-3 mr-1" />
                Ver
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteRedacao(redacao.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Minhas Redações</h2>
        </div>
        <Button onClick={onNewRedacao}>
          <PenTool className="w-4 h-4 mr-2" />
          Nova Redação
        </Button>
      </div>

      {redacoes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma redação encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece escrevendo sua primeira redação!
            </p>
            <Button onClick={onNewRedacao}>
              <PenTool className="w-4 h-4 mr-2" />
              Escrever Redação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              Todas ({redacoes.length})
            </TabsTrigger>
            <TabsTrigger value="rascunho">
              Rascunhos ({filterByStatus('rascunho').length})
            </TabsTrigger>
            <TabsTrigger value="enviada">
              Enviadas ({filterByStatus('enviada').length})
            </TabsTrigger>
            <TabsTrigger value="avaliada">
              Avaliadas ({filterByStatus('avaliada').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {redacoes.map((redacao) => (
              <RedacaoCard key={redacao.id} redacao={redacao} />
            ))}
          </TabsContent>
          
          <TabsContent value="rascunho" className="space-y-4">
            {filterByStatus('rascunho').map((redacao) => (
              <RedacaoCard key={redacao.id} redacao={redacao} />
            ))}
          </TabsContent>
          
          <TabsContent value="enviada" className="space-y-4">
            {filterByStatus('enviada').map((redacao) => (
              <RedacaoCard key={redacao.id} redacao={redacao} />
            ))}
          </TabsContent>
          
          <TabsContent value="avaliada" className="space-y-4">
            {filterByStatus('avaliada').map((redacao) => (
              <RedacaoCard key={redacao.id} redacao={redacao} />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}