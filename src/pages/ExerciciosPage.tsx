import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ExerciciosPage() {
  const exerciseSets = [
    {
      title: 'Matemática Básica',
      description: 'Operações fundamentais e resolução de problemas',
      exercises: 15,
      difficulty: 'Fácil',
      completed: 0,
      subject: 'Matemática'
    },
    {
      title: 'Português - Gramática',
      description: 'Classes de palavras e análise sintática',
      exercises: 12,
      difficulty: 'Médio',
      completed: 0,
      subject: 'Português'
    },
    {
      title: 'História do Brasil',
      description: 'Período colonial e imperial',
      exercises: 18,
      difficulty: 'Médio',
      completed: 0,
      subject: 'História'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-700';
      case 'Médio': return 'bg-yellow-100 text-yellow-700';
      case 'Difícil': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exercícios</h1>
          <p className="text-muted-foreground">Pratique e teste seus conhecimentos</p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Criar Lista Personalizada
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">45</p>
                <p className="text-sm text-muted-foreground">Exercícios Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">0</p>
                <p className="text-sm text-muted-foreground">Concluídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold">0h 0m</p>
                <p className="text-sm text-muted-foreground">Tempo de Estudo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Sets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exerciseSets.map((set, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{set.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{set.description}</p>
                </div>
                <Badge variant="secondary" className={getDifficultyColor(set.difficulty)}>
                  {set.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span>{set.completed}/{set.exercises} exercícios</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(set.completed / set.exercises) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">{set.subject}</Badge>
                  <span className="text-sm text-muted-foreground">{set.exercises} exercícios</span>
                </div>

                <Button className="w-full" variant={set.completed > 0 ? "secondary" : "default"}>
                  {set.completed > 0 ? 'Continuar' : 'Iniciar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Mais Exercícios em Breve</h3>
          <p className="text-muted-foreground">
            Estamos preparando mais conteúdos personalizados para você. Continue estudando!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}