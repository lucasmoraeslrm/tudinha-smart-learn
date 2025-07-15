import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function CreateExercise() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validOptions = options.filter(opt => opt.trim() !== '');
      
      if (validOptions.length < 2) {
        throw new Error('Pelo menos 2 opções são necessárias');
      }

      if (!correctAnswer || !validOptions.includes(correctAnswer)) {
        throw new Error('A resposta correta deve ser uma das opções');
      }

      const { error } = await supabase
        .from('exercises')
        .insert([{
          title,
          subject,
          question,
          options: validOptions,
          correct_answer: correctAnswer,
          explanation: explanation || null,
          difficulty
        }]);

      if (error) throw error;

      toast({
        title: "Exercício criado!",
        description: "O exercício foi criado com sucesso.",
      });

      // Reset form
      setTitle('');
      setSubject('');
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setExplanation('');
      setDifficulty('medium');
    } catch (error: any) {
      toast({
        title: "Erro ao criar exercício",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Novo Exercício</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título do exercício"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Matemática, Português..."
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question">Pergunta</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite a pergunta do exercício"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Opções de Resposta</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opção ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Opção
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correct">Resposta Correta</Label>
            <Select value={correctAnswer} onValueChange={setCorrectAnswer} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a resposta correta" />
              </SelectTrigger>
              <SelectContent>
                {options.filter(opt => opt.trim() !== '').map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explicação (Opcional)</Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explicação da resposta correta"
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Exercício'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}