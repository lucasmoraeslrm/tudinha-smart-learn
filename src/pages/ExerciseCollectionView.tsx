import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAlunoSerie } from '@/lib/student-utils';

export default function ExerciseCollectionView() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStudentId } = useAuth();
  const [collection, setCollection] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (collectionId) {
      loadCollection();
    }
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      setLoading(true);

      // Carregar dados da coleção
      const { data: collectionData, error: collectionError } = await supabase
        .from('exercise_collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collectionError) throw collectionError;

      // Verificar se o aluno tem acesso à coleção (pela série normalizada)
      const serieDoAluno = await getAlunoSerie();
      
      // Normalizar a série da coleção para comparação
      const serieColecaoNorm = collectionData.serie_escolar?.toLowerCase()
        ?.replace(/\bs[ée]rie\b/gi, 'ano')
        ?.replace(/\s+/g, ' ')
        ?.trim();
      
      if (serieDoAluno && serieColecaoNorm && serieDoAluno !== serieColecaoNorm) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setCollection(collectionData);

      // Carregar tópicos com exercícios
      const { data: topicsData, error: topicsError } = await supabase
        .from('exercise_topics')
        .select(`
          *,
          topic_exercises (
            id,
            enunciado,
            alternativas,
            resposta_correta
          )
        `)
        .eq('collection_id', collectionId)
        .order('ordem', { ascending: true });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (error: any) {
      console.error('Erro ao carregar coleção:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a coleção de exercícios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
        <p className="text-muted-foreground mb-4">
          Esta coleção não está disponível para a sua série escolar.
        </p>
        <Button onClick={() => navigate('/exercicios')}>
          Voltar às Coleções
        </Button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Coleção não encontrada.</p>
        <Button onClick={() => navigate('/exercicios')} className="mt-4">
          Voltar às Coleções
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/exercicios')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Coleções
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{collection.materia}</h1>
        <p className="text-muted-foreground">{collection.serie_escolar}</p>
      </div>

      {/* Topic Cards */}
      {topics.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Tópicos Disponíveis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card 
                key={topic.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/topico/${topic.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                        <BookOpen className="w-5 h-5" />
                        {topic.assunto}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {topic.topic_exercises?.length || 0} exercícios
                    </span>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      Começar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum Tópico Disponível</h3>
            <p className="text-muted-foreground">
              Esta coleção ainda não possui tópicos cadastrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}