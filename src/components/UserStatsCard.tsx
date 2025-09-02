import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Clock, Target, Zap } from 'lucide-react';
import { useGameification } from '@/hooks/useGameification';

export default function UserStatsCard() {
  const { userStats, loading, getProgressToNextLevel, getXPForNextLevel } = useGameification();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userStats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Target className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Comece estudando para ver suas estatísticas!</p>
        </CardContent>
      </Card>
    );
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const progressToNext = getProgressToNextLevel();
  const xpForNext = getXPForNextLevel();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Nível {userStats.level}
            </CardTitle>
            <CardDescription>
              {xpForNext} XP para o próximo nível
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {userStats.experience_points} XP
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso do Nível</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Streak */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Sequência</p>
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {userStats.current_streak} dias
              </p>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Recorde</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {userStats.longest_streak} dias
              </p>
            </div>
          </div>

          {/* Exercises */}
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Exercícios</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {userStats.total_exercises_completed}
              </p>
            </div>
          </div>

          {/* Study Time */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Estudo</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatStudyTime(userStats.total_study_time_minutes)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}