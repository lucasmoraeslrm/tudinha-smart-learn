import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useExerciseTimer } from '@/hooks/useExerciseTimer';

interface Exercise {
  id: string;
  enunciado: string;
  alternativas: any; // JSONB from database
  resposta_correta: string;
  explicacao?: string | null;
  ordem: number;
}

interface Topic {
  id: string;
  assunto: string;
  exercises: Exercise[];
}

interface ExercisePlayerProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
}

export default function ExercisePlayer({ collectionId, collectionName, onBack }: ExercisePlayerProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { 
    sessionTime, 
    formatTime, 
    startTimer, 
    resetQuestionTimer, 
    getQuestionTimeInSeconds
  } = useExerciseTimer();

  useEffect(() => {
    loadTopics();
  }, [collectionId]);

  const loadTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_topics')
        .select(`
          *,
          topic_exercises (*)
        `)
        .eq('collection_id', collectionId)
        .order('ordem');

      if (error) throw error;

      const topicsWithExercises = data.map(topic => ({
        ...topic,
        exercises: topic.topic_exercises?.sort((a: any, b: any) => a.ordem - b.ordem) || []
      }));

      setTopics(topicsWithExercises);
      
      if (topicsWithExercises.length > 0) {
        await startSession(topicsWithExercises[0].id);
        setTotalQuestions(topicsWithExercises[0].exercises.length);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os exercícios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (topicId: string) => {
    try {
      // Get current user (for demo, we'll use a placeholder)
      const studentId = 'demo-student-id'; // This should come from auth context

      const { data, error } = await supabase
        .from('student_exercise_sessions')
        .insert([
          {
            student_id: studentId,
            topic_id: topicId,
            total_questions: 5
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setStartTime(new Date());
      startTimer(); // Start the timer
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive"
      });
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !sessionId) return;

    setSubmitting(true);
    const currentExercise = topics[currentTopicIndex]?.exercises[currentExerciseIndex];
    if (!currentExercise) return;

    const timeSpent = getQuestionTimeInSeconds();
    const isCorrect = selectedAnswer === currentExercise.resposta_correta;

    try {
      const { error } = await supabase
        .from('student_question_responses')
        .insert([
          {
            session_id: sessionId,
            exercise_id: currentExercise.id,
            student_answer: selectedAnswer,
            is_correct: isCorrect,
            time_spent_seconds: timeSpent
          }
        ]);

      if (error) throw error;

      if (isCorrect) {
        setScore(prev => prev + 1);
      }

      setShowResult(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a resposta",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    if (currentExerciseIndex < topics[currentTopicIndex].exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
      resetQuestionTimer(); // Reset timer for next question
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    if (!sessionId || !startTime) return;

    const totalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('student_exercise_sessions')
        .update({
          finished_at: new Date().toISOString(),
          total_time_seconds: totalTime,
          score: score
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Exercícios concluídos!",
        description: `Você acertou ${score} de ${totalQuestions} questões em ${Math.floor(totalTime / 60)}min ${totalTime % 60}s`,
      });

      onBack();
    } catch (error) {
      console.error('Error finishing session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a sessão",
        variant: "destructive"
      });
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

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Nenhum exercício encontrado para esta coleção</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentTopic = topics[currentTopicIndex];
  const currentExercise = currentTopic?.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(sessionTime)}</span>
          </div>
          <Badge variant="secondary">
            {score}/{currentExerciseIndex + (showResult ? 1 : 0)} corretas
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Questão {currentExerciseIndex + 1} de {totalQuestions}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% concluído
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Topic and Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">{currentTopic.assunto}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentExercise.enunciado}</h3>
            
            <RadioGroup 
              value={selectedAnswer} 
              onValueChange={setSelectedAnswer}
              disabled={showResult}
            >
              {currentExercise.alternativas.map((alternativa: any) => (
                <div key={alternativa.letra} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={alternativa.letra} 
                    id={alternativa.letra}
                    className={showResult ? (
                      alternativa.letra === currentExercise.resposta_correta 
                        ? 'border-green-500' 
                        : alternativa.letra === selectedAnswer && selectedAnswer !== currentExercise.resposta_correta
                        ? 'border-red-500'
                        : ''
                    ) : ''}
                  />
                  <Label 
                    htmlFor={alternativa.letra}
                    className={`flex-1 cursor-pointer p-3 rounded-lg border transition-colors ${
                      showResult ? (
                        alternativa.letra === currentExercise.resposta_correta 
                          ? 'bg-green-50 border-green-200 text-green-800' 
                          : alternativa.letra === selectedAnswer && selectedAnswer !== currentExercise.resposta_correta
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-muted'
                      ) : (
                        selectedAnswer === alternativa.letra 
                          ? 'bg-primary/10 border-primary' 
                          : 'hover:bg-muted'
                      )
                    }`}
                  >
                    <span className="font-medium mr-2">{alternativa.letra})</span>
                    {alternativa.texto}
                    {showResult && alternativa.letra === currentExercise.resposta_correta && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {showResult && alternativa.letra === selectedAnswer && selectedAnswer !== currentExercise.resposta_correta && (
                      <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {showResult && currentExercise.explicacao && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Explicação:</h4>
              <p className="text-blue-800">{currentExercise.explicacao}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {!showResult ? (
              <Button 
                onClick={submitAnswer} 
                disabled={!selectedAnswer || submitting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitting ? "Enviando..." : "Confirmar Resposta"}
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {currentExerciseIndex < totalQuestions - 1 ? "Próxima Questão" : "Finalizar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}