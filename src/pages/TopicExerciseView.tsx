import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function TopicExerciseView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getStudentId } = useAuth();
  const [topic, setTopic] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (topicId) {
      loadTopic();
    }
  }, [topicId]);

  const loadTopic = async () => {
    try {
      setLoading(true);

      // Carregar tópico com exercícios
      const { data: topicData, error: topicError } = await supabase
        .from('exercise_topics')
        .select(`
          *,
          exercise_collections (materia, serie_escolar),
          topic_exercises (*)
        `)
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;

      setTopic(topicData);
      setExercises(topicData.topic_exercises || []);

      // Iniciar sessão
      await startSession();
    } catch (error: any) {
      console.error('Erro ao carregar tópico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o tópico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    const studentId = getStudentId();
    if (!studentId || !topicId) return;

    try {
      const { data, error } = await supabase
        .from('student_exercise_sessions')
        .insert({
          student_id: studentId,
          topic_id: topicId,
          total_questions: exercises.length
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !exercises[currentExerciseIndex] || !sessionId) return;

    setSubmitting(true);

    try {
      const currentExercise = exercises[currentExerciseIndex];
      const isAnswerCorrect = selectedOption === currentExercise.resposta_correta;

      // Salvar resposta
      const { error } = await supabase
        .from('student_question_responses')
        .insert({
          session_id: sessionId,
          exercise_id: currentExercise.id,
          student_answer: selectedOption,
          is_correct: isAnswerCorrect,
          time_spent_seconds: 30 // placeholder
        });

      if (error) throw error;

      setIsCorrect(isAnswerCorrect);
      setHasAnswered(true);

      if (isAnswerCorrect) {
        setScore(score + 1);
      }

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

  const nextQuestion = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedOption('');
      setHasAnswered(false);
      setIsCorrect(null);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('student_exercise_sessions')
        .update({
          finished_at: new Date().toISOString(),
          score: score,
          total_time_seconds: 300 // placeholder
        })
        .eq('id', sessionId);

      navigate('/exercicios');
    } catch (error) {
      console.error('Erro ao finalizar sessão:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!topic || exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Tópico não encontrado ou sem exercícios.</p>
        <Button onClick={() => navigate('/exercicios')} className="mt-4">
          Voltar às Coleções
        </Button>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];
  const options = currentExercise?.alternativas || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <div className="text-sm text-muted-foreground">
          {currentExerciseIndex + 1} / {exercises.length}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {topic.assunto}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {topic.exercise_collections?.materia} - {topic.exercise_collections?.serie_escolar}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentExercise.enunciado}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = selectedOption === option;
              const showResult = hasAnswered;
              const isCorrectOption = option === currentExercise.resposta_correta;
              
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

          {/* Actions */}
          {!hasAnswered ? (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="w-full"
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
          ) : (
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

              {currentExercise.explicacao && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Explicação:</h4>
                  <p className="text-blue-700">{currentExercise.explicacao}</p>
                </div>
              )}

              <Button onClick={nextQuestion} className="w-full" size="lg">
                {currentExerciseIndex < exercises.length - 1 ? 'Próxima Pergunta' : 'Finalizar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}