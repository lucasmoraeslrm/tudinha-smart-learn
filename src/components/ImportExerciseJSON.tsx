import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExerciseJSONData {
  materia: string;
  serie_escolar: string;
  listas_de_exercicios: {
    assunto: string;
    exercicios: {
      enunciado: string;
      alternativas: { letra: string; texto: string }[];
      resposta_correta: string;
      explicacao: string;
    }[];
  }[];
}

export default function ImportExerciseJSON() {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!jsonText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o JSON dos exercícios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const data: ExerciseJSONData = JSON.parse(jsonText);
      
      // Validate JSON structure
      if (!data.materia || !data.serie_escolar || !data.listas_de_exercicios) {
        throw new Error('JSON inválido: campos obrigatórios ausentes');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Create exercise collection
      const { data: collection, error: collectionError } = await supabase
        .from('exercise_collections')
        .insert([
          {
            materia: data.materia,
            serie_escolar: data.serie_escolar,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (collectionError) throw collectionError;

      // Process each topic (assunto)
      for (let topicIndex = 0; topicIndex < data.listas_de_exercicios.length; topicIndex++) {
        const topicData = data.listas_de_exercicios[topicIndex];
        
        // Create exercise topic
        const { data: topic, error: topicError } = await supabase
          .from('exercise_topics')
          .insert([
            {
              collection_id: collection.id,
              assunto: topicData.assunto,
              ordem: topicIndex + 1
            }
          ])
          .select()
          .single();

        if (topicError) throw topicError;

        // Create exercises for this topic
        const exercises = topicData.exercicios.map((exercise, exerciseIndex) => ({
          topic_id: topic.id,
          enunciado: exercise.enunciado,
          alternativas: exercise.alternativas,
          resposta_correta: exercise.resposta_correta,
          explicacao: exercise.explicacao,
          ordem: exerciseIndex + 1
        }));

        const { error: exercisesError } = await supabase
          .from('topic_exercises')
          .insert(exercises);

        if (exercisesError) throw exercisesError;
      }

      toast({
        title: "Sucesso!",
        description: `Importados ${data.listas_de_exercicios.length} tópicos de exercícios para ${data.materia} - ${data.serie_escolar}`,
      });

      setJsonText('');
      setIsOpen(false);

    } catch (error) {
      console.error('Error importing JSON:', error);
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exampleJSON = {
    "materia": "Matemática",
    "serie_escolar": "7º Ano",
    "listas_de_exercicios": [
      {
        "assunto": "Álgebra Básica",
        "exercicios": [
          {
            "enunciado": "Qual é o valor de x na equação 2x + 5 = 11?",
            "alternativas": [
              {"letra": "A", "texto": "2"},
              {"letra": "B", "texto": "3"},
              {"letra": "C", "texto": "4"},
              {"letra": "D", "texto": "5"}
            ],
            "resposta_correta": "B",
            "explicacao": "2x + 5 = 11, então 2x = 6, logo x = 3"
          }
        ]
      }
    ]
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Upload className="w-4 h-4 mr-2" />
          Importar JSON
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Importar Exercícios via JSON
          </DialogTitle>
          <DialogDescription>
            Cole o JSON com a estrutura de exercícios abaixo. Cada matéria pode ter múltiplos assuntos, e cada assunto deve ter exatamente 5 exercícios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="json-input">JSON dos Exercícios</Label>
            <Textarea
              id="json-input"
              placeholder={`Exemplo:\n${JSON.stringify(exampleJSON, null, 2)}`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="h-96 font-mono text-sm"
            />
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setJsonText(JSON.stringify(exampleJSON, null, 2))}
            >
              Usar Exemplo
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImport} disabled={isLoading}>
                {isLoading ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}