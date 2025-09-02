-- Create gamification tables and functions

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_code text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, achievement_code)
);

-- Create user stats table for streak and other metrics
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  total_exercises_completed integer DEFAULT 0,
  total_study_time_minutes integer DEFAULT 0,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
DROP POLICY IF EXISTS "users_can_manage_own_achievements" ON user_achievements;
CREATE POLICY "users_can_manage_own_achievements" ON user_achievements
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS Policies for stats
DROP POLICY IF EXISTS "users_can_manage_own_stats" ON user_stats;
CREATE POLICY "users_can_manage_own_stats" ON user_stats
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Function to update streak on login
CREATE OR REPLACE FUNCTION update_streak_on_login(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_last_activity date;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_current_streak integer := 0;
  v_longest_streak integer := 0;
BEGIN
  -- Get current user stats
  SELECT 
    last_activity_date, 
    current_streak, 
    longest_streak
  INTO 
    v_last_activity, 
    v_current_streak, 
    v_longest_streak
  FROM user_stats 
  WHERE user_id = p_user_id;
  
  -- If no stats record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, v_today);
    RETURN;
  END IF;
  
  -- Calculate new streak
  IF v_last_activity IS NULL THEN
    -- First time
    v_current_streak := 1;
  ELSIF v_last_activity = v_today THEN
    -- Same day, no change
    RETURN;
  ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
    -- Consecutive day
    v_current_streak := v_current_streak + 1;
  ELSE
    -- Streak broken
    v_current_streak := 1;
  END IF;
  
  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;
  
  -- Update stats
  UPDATE user_stats 
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Check for streak achievements
  IF v_current_streak = 7 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'STREAK_7_DAYS', json_build_object('streak', v_current_streak))
    ON CONFLICT DO NOTHING;
  ELSIF v_current_streak = 30 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'STREAK_30_DAYS', json_build_object('streak', v_current_streak))
    ON CONFLICT DO NOTHING;
  ELSIF v_current_streak = 100 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'STREAK_100_DAYS', json_build_object('streak', v_current_streak))
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Function to update exercise completion stats
CREATE OR REPLACE FUNCTION update_exercise_completion_stats(p_user_id uuid, p_study_time_minutes integer DEFAULT 5)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  v_total_exercises integer;
  v_total_time integer;
  v_new_level integer;
  v_new_xp integer;
BEGIN
  -- Update stats
  UPDATE user_stats 
  SET 
    total_exercises_completed = total_exercises_completed + 1,
    total_study_time_minutes = total_study_time_minutes + p_study_time_minutes,
    experience_points = experience_points + 10,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Get updated stats
  SELECT 
    total_exercises_completed, 
    total_study_time_minutes,
    experience_points
  INTO 
    v_total_exercises, 
    v_total_time,
    v_new_xp
  FROM user_stats 
  WHERE user_id = p_user_id;
  
  -- Calculate new level (every 100 XP = 1 level)
  v_new_level := (v_new_xp / 100) + 1;
  
  -- Update level
  UPDATE user_stats 
  SET level = v_new_level
  WHERE user_id = p_user_id;
  
  -- Check for exercise-based achievements
  IF v_total_exercises = 10 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'FIRST_10_EXERCISES', json_build_object('total', v_total_exercises))
    ON CONFLICT DO NOTHING;
  ELSIF v_total_exercises = 50 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'EXERCISE_MASTER_50', json_build_object('total', v_total_exercises))
    ON CONFLICT DO NOTHING;
  ELSIF v_total_exercises = 100 THEN
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'EXERCISE_CHAMPION_100', json_build_object('total', v_total_exercises))
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for study time achievements (in hours)
  IF v_total_time >= 60 THEN -- 1 hour
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'STUDY_TIME_1_HOUR', json_build_object('minutes', v_total_time))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF v_total_time >= 600 THEN -- 10 hours
    INSERT INTO user_achievements (user_id, achievement_code, metadata)
    VALUES (p_user_id, 'STUDY_TIME_10_HOURS', json_build_object('minutes', v_total_time))
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Add updated_at trigger for user_stats
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_code ON user_achievements(achievement_code);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);