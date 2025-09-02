import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, Clock, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemaRedacao {
  id: string;
  titulo: string;
  texto_motivador: string;
  competencias: any;
  created_at: string;
}

interface TemasRedacaoListProps {
  onSelectTema: (tema: TemaRedacao) => void;
}

export default function TemasRedacaoList({ onSelectTema }: TemasRedacaoListProps) {
  const [temas, setTemas] = useState<TemaRedacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemas();
  }, []);

  const loadTemas = async () => {
    try {
      const { data, error } = await supabase
        .from('temas_redacao')
        .select('*')
        .eq('publica', true)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemas(data || []);
    } catch (error) {
      console.error('Error loading themes:', error);
      toast({
        title: "Erro ao carregar temas",
        description: "Não foi possível carregar os temas de redação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Temas de Redação</h2>
        <Badge variant="secondary">{temas.length} disponíveis</Badge>
      </div>

      {temas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PenTool className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum tema disponível</h3>
            <p className="text-muted-foreground text-center">
              Aguarde novos temas de redação serem publicados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {temas.map((tema) => (
            <Card key={tema.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{tema.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Publicado em {formatDate(tema.created_at)}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => onSelectTema(tema)}
                    className="ml-4"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    Escrever
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tema.texto_motivador && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Texto Motivador:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tema.texto_motivador.substring(0, 200)}
                      {tema.texto_motivador.length > 200 && '...'}
                    </p>
                  </div>
                )}
                {tema.competencias && Array.isArray(tema.competencias) && tema.competencias.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Competências avaliadas:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tema.competencias.map((comp: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}