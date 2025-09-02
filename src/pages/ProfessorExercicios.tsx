import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Search, BarChart3, TrendingUp, Users } from 'lucide-react';

interface ProfessorExerciciosProps {
  professorData: any;
}

export default function ProfessorExercicios({ professorData }: ProfessorExerciciosProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    carregarDados();
  }, [professorData]);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, subjectFilter, difficultyFilter, exercises]);

  const carregarDados = async () => {
    try {
      // Buscar exercícios
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (exercisesError) {
        console.error('Erro ao carregar exercícios:', exercisesError);
        return;
      }

      // Buscar respostas dos alunos do professor
      let studentAnswersData = [];
      if (professorData?.codigo) {
        const { data: answers, error: answersError } = await supabase
          .from('student_answers')
          .select(`
            *,
            students!inner(
              id, name,
              turmas!inner(
                id, nome,
                professor_materia_turma!inner(
                  professores!inner(codigo)
                )
              )
            )
          `)
          .eq('students.turmas.professor_materia_turma.professores.codigo', professorData.codigo);

        if (!answersError) {
          studentAnswersData = answers || [];
        }
      }

      setExercises(exercisesData || []);
      setStudentAnswers(studentAnswersData);
      
      // Extrair matérias únicas
      const uniqueSubjects = [...new Set(exercisesData?.map(ex => ex.subject) || [])];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.subject === subjectFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === difficultyFilter);
    }

    setFilteredExercises(filtered);
  };

  const getExerciseStats = (exerciseId: string) => {
    const answers = studentAnswers.filter(answer => answer.exercise_id === exerciseId);
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter(answer => answer.is_correct).length;
    const successRate = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return {
      totalAnswers,
      correctAnswers,
      successRate: Math.round(successRate)
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalStats = {
    totalExercises: exercises.length,
    totalAnswers: studentAnswers.length,
    averageSuccess: studentAnswers.length > 0 
      ? Math.round((studentAnswers.filter(a => a.is_correct).length / studentAnswers.length) * 100)
      : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exercícios</h1>
        <p className="text-muted-foreground">
          Exercícios disponíveis e estatísticas de desempenho dos seus alunos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Exercícios</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalExercises}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas dos Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalAnswers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.averageSuccess}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por matéria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as matérias</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as dificuldades</SelectItem>
            <SelectItem value="easy">Fácil</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="hard">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || subjectFilter !== 'all' || difficultyFilter !== 'all'
                  ? 'Nenhum exercício encontrado com os filtros aplicados'
                  : 'Nenhum exercício encontrado'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExercises.map((exercise) => {
            const stats = getExerciseStats(exercise.id);
            return (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{exercise.subject}</Badge>
                        <Badge className={getDifficultyColor(exercise.difficulty)}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{stats.successRate}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{stats.totalAnswers}</div>
                        <div className="text-xs text-muted-foreground">Respostas</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{exercise.question}</p>
                    
                    {stats.totalAnswers > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2">Estatísticas dos Alunos</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-green-600">{stats.correctAnswers}</div>
                            <div className="text-xs text-muted-foreground">Corretas</div>
                          </div>
                          <div>
                            <div className="font-medium text-red-600">{stats.totalAnswers - stats.correctAnswers}</div>
                            <div className="text-xs text-muted-foreground">Incorretas</div>
                          </div>
                          <div>
                            <div className="font-medium">{stats.totalAnswers}</div>
                            <div className="text-xs text-muted-foreground">Total</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}