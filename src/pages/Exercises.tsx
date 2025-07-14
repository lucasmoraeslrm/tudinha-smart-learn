import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, ArrowLeft, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Exercise {
  id: string;
  title: string;
  subject: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  difficulty: string;
}

interface StudentAnswer {
  exercise_id: string;
  is_correct: boolean;
}

const Exercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExercises();
    loadStudentAnswers();
  }, []);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedExercises = data.map(exercise => ({
          ...exercise,
          options: Array.isArray(exercise.options) ? exercise.options : JSON.parse(String(exercise.options) || '[]')
        })) as Exercise[];
        setExercises(formattedExercises);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
      toast({
        title: "Erro ao carregar exercícios",
        description: "Não foi possível carregar os exercícios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentAnswers = async () => {
    try {
      const studentId = localStorage.getItem('tudinha_student_id');
      if (!studentId) return;

      const { data, error } = await supabase
        .from('student_answers')
        .select('exercise_id, is_correct')
        .eq('student_id', studentId);

      if (error) throw error;
      if (data) setStudentAnswers(data);
    } catch (error) {
      console.error('Error loading student answers:', error);
    }
  };

  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentExercise) return;

    const correct = selectedAnswer === currentExercise.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    // Save answer to database
    try {
      let studentId = localStorage.getItem('tudinha_student_id');
      
      // Create student record if doesn't exist
      if (!studentId) {
        const userName = localStorage.getItem('tudinha_user_name') || 'Estudante';
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .insert({ name: userName })
          .select()
          .single();

        if (studentError) throw studentError;
        
        studentId = studentData.id;
        localStorage.setItem('tudinha_student_id', studentId);
      }

      const { error } = await supabase
        .from('student_answers')
        .insert({
          student_id: studentId,
          exercise_id: currentExercise.id,
          user_answer: selectedAnswer,
          is_correct: correct
        });

      if (error) throw error;

      // Update local answers
      setStudentAnswers(prev => [
        ...prev.filter(a => a.exercise_id !== currentExercise.id),
        { exercise_id: currentExercise.id, is_correct: correct }
      ]);

      toast({
        title: correct ? "Correto! 🎉" : "Não foi dessa vez 😅",
        description: correct ? "Parabéns! Você acertou!" : "Continue tentando, você consegue!",
        variant: correct ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const goBack = () => {
    setCurrentExercise(null);
    setShowResult(false);
  };

  const getExerciseStatus = (exerciseId: string) => {
    const answer = studentAnswers.find(a => a.exercise_id === exerciseId);
    return answer ? (answer.is_correct ? 'correct' : 'incorrect') : 'unanswered';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg">Carregando exercícios...</p>
        </div>
      </div>
    );
  }

  if (currentExercise) {
    const status = getExerciseStatus(currentExercise.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={goBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Badge className={getDifficultyColor(currentExercise.difficulty)}>
              {getDifficultyLabel(currentExercise.difficulty)}
            </Badge>
            {status !== 'unanswered' && (
              <Badge variant={status === 'correct' ? 'default' : 'destructive'}>
                {status === 'correct' ? '✓ Respondido' : '✗ Respondido'}
              </Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {currentExercise.title}
              </CardTitle>
              <CardDescription>{currentExercise.subject}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 text-lg">{currentExercise.question}</h3>
                
                <div className="space-y-3">
                  {currentExercise.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedAnswer === option ? 'border-primary bg-primary/5' : 'border-border'
                      } ${showResult && option === currentExercise.correct_answer ? 'border-green-500 bg-green-50' : ''} ${
                        showResult && selectedAnswer === option && option !== currentExercise.correct_answer ? 'border-red-500 bg-red-50' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedAnswer === option}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        disabled={showResult}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border-2 rounded-full mr-3 flex-shrink-0 ${
                        selectedAnswer === option ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {selectedAnswer === option && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                      {showResult && option === currentExercise.correct_answer && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      )}
                      {showResult && selectedAnswer === option && option !== currentExercise.correct_answer && (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {!showResult && (
                <Button 
                  onClick={submitAnswer} 
                  disabled={!selectedAnswer}
                  className="w-full"
                >
                  Confirmar Resposta
                </Button>
              )}

              {showResult && (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correto!' : 'Incorreto!'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Resposta correta:</strong> {currentExercise.correct_answer}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Explicação:</strong> {currentExercise.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const correctAnswers = studentAnswers.filter(a => a.is_correct).length;
  const totalAnswered = studentAnswers.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Exercícios</h1>
            <Link to="/">
              <Button variant="outline">Voltar ao Chat</Button>
            </Link>
          </div>
          
          {totalAnswered > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Trophy className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">Seu Progresso</p>
                    <p className="text-sm text-muted-foreground">
                      {correctAnswers} de {totalAnswered} exercícios corretos 
                      ({totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => {
            const status = getExerciseStatus(exercise.id);
            
            return (
              <Card 
                key={exercise.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => selectExercise(exercise)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <CardDescription>{exercise.subject}</CardDescription>
                    </div>
                    {status === 'correct' && (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                    {status === 'incorrect' && (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                  <Badge className={getDifficultyColor(exercise.difficulty)} variant="secondary">
                    {getDifficultyLabel(exercise.difficulty)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exercise.question}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Exercises;