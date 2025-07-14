import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, BookOpen, ArrowLeft, Trophy, List, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface ExerciseList {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  exercise_ids: string[];
  created_at: string;
}

interface StudentAnswer {
  exercise_id: string;
  is_correct: boolean;
  list_id?: string;
}

const Exercises = () => {
  const [exerciseLists, setExerciseLists] = useState<ExerciseList[]>([]);
  const [selectedList, setSelectedList] = useState<ExerciseList | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExerciseLists();
    loadStudentAnswers();
  }, []);

  const loadExerciseLists = async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_lists')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setExerciseLists(data);
    } catch (error) {
      console.error('Error loading exercise lists:', error);
      toast({
        title: "Erro ao carregar listas",
        description: "Não foi possível carregar as listas de exercícios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesFromList = async (listId: string, exerciseIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds)
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
    }
  };

  const loadStudentAnswers = async () => {
    try {
      const studentId = localStorage.getItem('tudinha_student_id');
      if (!studentId) return;

      const { data, error } = await supabase
        .from('student_answers')
        .select('exercise_id, is_correct, list_id')
        .eq('student_id', studentId);

      if (error) throw error;
      if (data) setStudentAnswers(data);
    } catch (error) {
      console.error('Error loading student answers:', error);
    }
  };

  const selectList = (list: ExerciseList) => {
    setSelectedList(list);
    loadExercisesFromList(list.id, list.exercise_ids);
  };

  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentExercise || !selectedList) return;

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
          is_correct: correct,
          list_id: selectedList.id
        });

      if (error) throw error;

      // Update local answers
      setStudentAnswers(prev => [
        ...prev.filter(a => a.exercise_id !== currentExercise.id),
        { exercise_id: currentExercise.id, is_correct: correct, list_id: selectedList.id }
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

  const goBackToExercises = () => {
    setCurrentExercise(null);
    setShowResult(false);
  };

  const goBackToLists = () => {
    setSelectedList(null);
    setExercises([]);
    setCurrentExercise(null);
  };

  const getExerciseStatus = (exerciseId: string) => {
    const answer = studentAnswers.find(a => a.exercise_id === exerciseId);
    return answer ? (answer.is_correct ? 'correct' : 'incorrect') : 'unanswered';
  };

  const getListProgress = (listId: string, exerciseIds: string[]) => {
    const listAnswers = studentAnswers.filter(a => a.list_id === listId);
    const correctAnswers = listAnswers.filter(a => a.is_correct).length;
    return {
      answered: listAnswers.length,
      correct: correctAnswers,
      total: exerciseIds.length,
      percentage: listAnswers.length > 0 ? Math.round((correctAnswers / listAnswers.length) * 100) : 0
    };
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

  // Exercise view
  if (currentExercise) {
    const status = getExerciseStatus(currentExercise.id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={goBackToExercises}
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
                  {currentExercise.explanation && (
                    <p className="text-sm text-gray-600">
                      <strong>Explicação:</strong> {currentExercise.explanation}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Exercise list view
  if (selectedList) {
    const progress = getListProgress(selectedList.id, selectedList.exercise_ids);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                onClick={goBackToLists}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar às Listas
              </Button>
              <Badge className={getDifficultyColor(selectedList.difficulty)}>
                {getDifficultyLabel(selectedList.difficulty)}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{selectedList.title}</h1>
            <p className="text-muted-foreground mb-4">{selectedList.description}</p>
            
            {progress.answered > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold">Progresso nesta Lista</p>
                      <p className="text-sm text-muted-foreground">
                        {progress.correct} de {progress.answered} exercícios corretos 
                        ({progress.percentage}%)
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
  }

  // Lists overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Listas de Exercícios</h1>
          <p className="text-muted-foreground">Escolha uma lista para começar a praticar</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exerciseLists.map((list) => {
            const progress = getListProgress(list.id, list.exercise_ids);
            
            return (
              <Card 
                key={list.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => selectList(list)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <List className="w-5 h-5" />
                        {list.title}
                      </CardTitle>
                      <CardDescription>{list.subject}</CardDescription>
                    </div>
                    <Play className="w-6 h-6 text-primary flex-shrink-0" />
                  </div>
                  <Badge className={getDifficultyColor(list.difficulty)} variant="secondary">
                    {getDifficultyLabel(list.difficulty)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {list.description}
                  </p>
                  <div className="text-sm">
                    <p className="font-medium">{list.exercise_ids.length} exercícios</p>
                    {progress.answered > 0 && (
                      <p className="text-muted-foreground">
                        {progress.correct}/{progress.answered} corretos ({progress.percentage}%)
                      </p>
                    )}
                  </div>
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