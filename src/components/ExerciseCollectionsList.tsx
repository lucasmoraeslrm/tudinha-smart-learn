import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Trophy, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExerciseCollection {
  id: string;
  materia: string;
  serie_escolar: string;
  created_at: string;
  topics_count: number;
  total_exercises: number;
}

interface ExerciseCollectionsListProps {
  onSelectCollection: (collection: ExerciseCollection) => void;
}

export default function ExerciseCollectionsList({ onSelectCollection }: ExerciseCollectionsListProps) {
  const [collections, setCollections] = useState<ExerciseCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_collections')
        .select(`
          *,
          exercise_topics (
            id,
            topic_exercises (
              id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const collectionsWithCounts = data.map(collection => ({
        ...collection,
        topics_count: collection.exercise_topics?.length || 0,
        total_exercises: collection.exercise_topics?.reduce((total: number, topic: any) => 
          total + (topic.topic_exercises?.length || 0), 0) || 0
      }));

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as coleções de exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Carregando exercícios...</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma coleção de exercícios encontrada</p>
          <p className="text-muted-foreground/60 text-sm">Use o botão "Importar JSON" para adicionar exercícios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card key={collection.id} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg text-foreground">{collection.materia}</CardTitle>
                <CardDescription>{collection.serie_escolar}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {collection.topics_count} tópicos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{collection.total_exercises} exercícios</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>~{collection.total_exercises * 2} min estimados</span>
              </div>
              
              <Button 
                onClick={() => onSelectCollection(collection)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Iniciar Exercícios
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}