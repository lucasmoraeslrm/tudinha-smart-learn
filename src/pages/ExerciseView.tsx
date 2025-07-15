import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function ExerciseView() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStudentId } = useAuth();
  const [exercise, setExercise] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exerciseId) {
      loadExercise();
    }
  }, [exerciseId]);

  const loadExercise = async () => {
    try {
      setLoading(true);

      // Carregar dados do exercício
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (exerciseError) throw exerciseError;

      setExercise(exerciseData);

      // Verificar se o estudante já respondeu este exercício
      const studentId = getStudentId();
      if (studentId) {
        const { data: answerData } = await supabase
          .from('student_answers')
          .select('*')
          .eq('exercise_id', exerciseId)
          .eq('student_id', studentId)
          .single();

        if (answerData) {
          setSelectedOption(answerData.user_answer);
          setHasAnswered(true);
          setIsCorrect(answerData.is_correct);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar exercício:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o exercício.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !exercise) return;

    setSubmitting(true);

    try {
      const isAnswerCorrect = selectedOption === exercise.correct_answer;
      const studentId = getStudentId();

      if (studentId) {
        // Salvar resposta no banco
        const { error } = await supabase
          .from('student_answers')
          .insert({
            student_id: studentId,
            exercise_id: exercise.id,
            user_answer: selectedOption,
            is_correct: isAnswerCorrect
          });

        if (error) throw error;
      }

      setIsCorrect(isAnswerCorrect);
      setHasAnswered(true);

      toast({
        title: isAnswerCorrect ? "Correto!" : "Incorreto",
        description: isAnswerCorrect 
          ? "Parabéns! Você acertou a resposta." 
          : "Resposta incorreta. Continue estudando!",
        variant: isAnswerCorrect ? "default" : "destructive",
      });

    } catch (error: any) {
      console.error('Erro ao salvar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar sua resposta.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'fácil':
      case 'facil':
      case 'easy': 
        return 'bg-green-100 text-green-700';
      case 'médio':
      case 'medio':
      case 'medium': 
        return 'bg-yellow-100 text-yellow-700';
      case 'difícil':
      case 'dificil':
      case 'hard': 
        return 'bg-red-100 text-red-700';
      default: 
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Exercício não encontrado.</p>
        <Button onClick={() => navigate('/exercicios')} className="mt-4">
          Voltar às Listas
        </Button>
      </div>
    );
  }

  const options = exercise.options || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <Badge className={getDifficultyColor(exercise.difficulty)}>
          {exercise.difficulty || 'Médio'}
        </Badge>
      </div>

      {/* Exercise Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {exercise.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{exercise.subject}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{exercise.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
              const isSelected = selectedOption === option;
              const showResult = hasAnswered;
              const isCorrectOption = option === exercise.correct_answer;
              
              let cardClass = "border-2 cursor-pointer transition-all ";
              
              if (showResult) {
                if (isCorrectOption) {
                  cardClass += "border-green-500 bg-green-50 ";
                } else if (isSelected && !isCorrectOption) {
                  cardClass += "border-red-500 bg-red-50 ";
                } else {
                  cardClass += "border-gray-200 ";
                }
              } else {
                cardClass += isSelected 
                  ? "border-primary bg-primary/5 " 
                  : "border-gray-200 hover:border-gray-300 ";
              }

              return (
                <Card 
                  key={index}
                  className={cardClass}
                  onClick={() => !hasAnswered && setSelectedOption(option)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {showResult && isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        )}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-gray-300'
                        }`}>
                          {optionLetter}
                        </div>
                      </div>
                      <span className="flex-1">{option}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Submit Button */}
          {!hasAnswered && (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Resposta'
              )}
            </Button>
          )}

          {/* Result */}
          {hasAnswered && (
            <div className="text-center space-y-4">
              <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Resposta Correta!
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" />
                    Resposta Incorreta
                  </>
                )}
              </div>

              {exercise.explanation && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
                  <p className="text-blue-700">{exercise.explanation}</p>
                </div>
              )}

              <Button onClick={() => navigate('/exercicios')} variant="outline">
                Voltar às Listas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}