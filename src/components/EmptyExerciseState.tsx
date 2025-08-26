import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function EmptyExerciseState({ onDataAdded }: { onDataAdded: () => void }) {
  const { toast } = useToast();

  const addSampleData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'demo-user-id';

      // Create sample collection
      const { data: collection, error: collectionError } = await supabase
        .from('exercise_collections')
        .insert([
          {
            materia: 'Matemática',
            serie_escolar: '7º Ano',
            created_by: userId
          }
        ])
        .select()
        .single();

      if (collectionError) throw collectionError;

      // Create sample topic
      const { data: topic, error: topicError } = await supabase
        .from('exercise_topics')
        .insert([
          {
            collection_id: collection.id,
            assunto: 'Álgebra Básica',
            ordem: 1
          }
        ])
        .select()
        .single();

      if (topicError) throw topicError;

      // Create sample exercises
      const sampleExercises = [
        {
          topic_id: topic.id,
          enunciado: 'Qual é o valor de x na equação 2x + 5 = 11?',
          alternativas: [
            { letra: 'A', texto: '2' },
            { letra: 'B', texto: '3' },
            { letra: 'C', texto: '4' },
            { letra: 'D', texto: '5' }
          ],
          resposta_correta: 'B',
          explicacao: '2x + 5 = 11, então 2x = 6, logo x = 3',
          ordem: 1
        },
        {
          topic_id: topic.id,
          enunciado: 'Resolva a equação: 3x - 7 = 14',
          alternativas: [
            { letra: 'A', texto: '5' },
            { letra: 'B', texto: '6' },
            { letra: 'C', texto: '7' },
            { letra: 'D', texto: '8' }
          ],
          resposta_correta: 'C',
          explicacao: '3x - 7 = 14, então 3x = 21, logo x = 7',
          ordem: 2
        },
        {
          topic_id: topic.id,
          enunciado: 'Se y = 2x + 3 e x = 4, qual é o valor de y?',
          alternativas: [
            { letra: 'A', texto: '9' },
            { letra: 'B', texto: '10' },
            { letra: 'C', texto: '11' },
            { letra: 'D', texto: '12' }
          ],
          resposta_correta: 'C',
          explicacao: 'y = 2(4) + 3 = 8 + 3 = 11',
          ordem: 3
        },
        {
          topic_id: topic.id,
          enunciado: 'Qual é o resultado de (x + 2)(x - 3) quando x = 5?',
          alternativas: [
            { letra: 'A', texto: '12' },
            { letra: 'B', texto: '13' },
            { letra: 'C', texto: '14' },
            { letra: 'D', texto: '15' }
          ],
          resposta_correta: 'C',
          explicacao: '(5 + 2)(5 - 3) = 7 × 2 = 14',
          ordem: 4
        },
        {
          topic_id: topic.id,
          enunciado: 'Encontre o valor de a na equação: a/3 + 2 = 6',
          alternativas: [
            { letra: 'A', texto: '10' },
            { letra: 'B', texto: '11' },
            { letra: 'C', texto: '12' },
            { letra: 'D', texto: '13' }
          ],
          resposta_correta: 'C',
          explicacao: 'a/3 + 2 = 6, então a/3 = 4, logo a = 12',
          ordem: 5
        }
      ];

      const { error: exercisesError } = await supabase
        .from('topic_exercises')
        .insert(sampleExercises);

      if (exercisesError) throw exercisesError;

      toast({
        title: "Dados de exemplo criados!",
        description: "Uma coleção de exemplo foi adicionada com 5 exercícios de Álgebra Básica",
      });

      onDataAdded();

    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar os dados de exemplo",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardContent className="text-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma coleção de exercícios encontrada</h3>
        <p className="text-muted-foreground mb-6">
          Use o botão "Importar JSON" para adicionar exercícios ou crie dados de exemplo para testar
        </p>
        <Button onClick={addSampleData} variant="outline" className="mr-2">
          <Plus className="w-4 h-4 mr-2" />
          Criar Dados de Exemplo
        </Button>
      </CardContent>
    </Card>
  );
}