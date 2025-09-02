import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserStats {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_exercises_completed: number;
  total_study_time_minutes: number;
  level: number;
  experience_points: number;
}

interface Achievement {
  user_id: string;
  achievement_code: string;
  unlocked_at: string;
  metadata: any;
}

export function useGameification() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserData();
      updateStreakOnLogin();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!statsError && statsData) {
        setUserStats(statsData);
      }

      // Load achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (!achievementsError && achievementsData) {
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreakOnLogin = async () => {
    if (!user) return;

    try {
      await supabase.rpc('update_streak_on_login', {
        p_user_id: user.id
      });
      // Reload data after streak update
      setTimeout(() => loadUserData(), 1000);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const updateExerciseCompletion = async (studyTimeMinutes: number = 5) => {
    if (!user) return;

    try {
      await supabase.rpc('update_exercise_completion_stats', {
        p_user_id: user.id,
        p_study_time_minutes: studyTimeMinutes
      });
      // Reload data after exercise completion
      setTimeout(() => loadUserData(), 1000);
    } catch (error) {
      console.error('Error updating exercise stats:', error);
    }
  };

  const getProgressToNextLevel = () => {
    if (!userStats) return 0;
    const currentLevelXP = (userStats.level - 1) * 100;
    const nextLevelXP = userStats.level * 100;
    const progress = userStats.experience_points - currentLevelXP;
    const total = nextLevelXP - currentLevelXP;
    return Math.min((progress / total) * 100, 100);
  };

  const getXPForNextLevel = () => {
    if (!userStats) return 0;
    const nextLevelXP = userStats.level * 100;
    return nextLevelXP - userStats.experience_points;
  };

  return {
    userStats,
    achievements,
    loading,
    updateExerciseCompletion,
    getProgressToNextLevel,
    getXPForNextLevel,
    refreshData: loadUserData
  };
}