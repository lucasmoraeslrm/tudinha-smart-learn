import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Flame, Clock, Target, Star } from 'lucide-react';
import { useGameification } from '@/hooks/useGameification';

interface AchievementDefinition {
  code: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    code: 'STREAK_7_DAYS',
    title: 'Uma Semana de Fogo',
    description: 'Estudou por 7 dias consecutivos',
    icon: Flame,
    color: 'text-orange-500'
  },
  {
    code: 'STREAK_30_DAYS',
    title: 'Mestre da Consistência',
    description: 'Estudou por 30 dias consecutivos',
    icon: Flame,
    color: 'text-red-500'
  },
  {
    code: 'STREAK_100_DAYS',
    title: 'Lenda da Disciplina',
    description: 'Estudou por 100 dias consecutivos',
    icon: Flame,
    color: 'text-purple-500'
  },
  {
    code: 'FIRST_10_EXERCISES',
    title: 'Primeiros Passos',
    description: 'Completou 10 exercícios',
    icon: Target,
    color: 'text-green-500'
  },
  {
    code: 'EXERCISE_MASTER_50',
    title: 'Praticante Dedicado',
    description: 'Completou 50 exercícios',
    icon: Award,
    color: 'text-blue-500'
  },
  {
    code: 'EXERCISE_CHAMPION_100',
    title: 'Campeão dos Exercícios',
    description: 'Completou 100 exercícios',
    icon: Trophy,
    color: 'text-yellow-500'
  },
  {
    code: 'STUDY_TIME_1_HOUR',
    title: 'Primeira Hora',
    description: 'Estudou por 1 hora total',
    icon: Clock,
    color: 'text-indigo-500'
  },
  {
    code: 'STUDY_TIME_10_HOURS',
    title: 'Estudante Comprometido',
    description: 'Estudou por 10 horas total',
    icon: Clock,
    color: 'text-pink-500'
  }
];

export default function AchievementsPanel() {
  const { achievements, loading } = useGameification();

  const getAchievementDefinition = (code: string) => {
    return ACHIEVEMENT_DEFINITIONS.find(def => def.code === code);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-muted-foreground/20 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <CardTitle>Conquistas</CardTitle>
        </div>
        <CardDescription>
          {achievements.length} conquista{achievements.length !== 1 ? 's' : ''} desbloqueada{achievements.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Star className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Continue estudando para desbloquear suas primeiras conquistas!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map((achievement) => {
              const definition = getAchievementDefinition(achievement.achievement_code);
              
              if (!definition) {
                return (
                  <div key={achievement.achievement_code} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-muted rounded-full">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.achievement_code}</p>
                      <p className="text-sm text-muted-foreground">
                        Desbloqueada em {formatDate(achievement.unlocked_at)}
                      </p>
                    </div>
                  </div>
                );
              }

              const Icon = definition.icon;
              
              return (
                <div key={achievement.achievement_code} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <Icon className={`w-4 h-4 ${definition.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{definition.title}</p>
                      <Badge variant="secondary" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Nova!
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {definition.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(achievement.unlocked_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Available Achievements Preview */}
        {achievements.length < ACHIEVEMENT_DEFINITIONS.length && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-sm mb-3 text-muted-foreground">Próximas Conquistas</h4>
            <div className="space-y-2">
              {ACHIEVEMENT_DEFINITIONS
                .filter(def => !achievements.some(a => a.achievement_code === def.code))
                .slice(0, 3)
                .map((definition) => {
                  const Icon = definition.icon;
                  return (
                    <div key={definition.code} className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                      <div className="p-1 bg-muted rounded-full">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{definition.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {definition.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}