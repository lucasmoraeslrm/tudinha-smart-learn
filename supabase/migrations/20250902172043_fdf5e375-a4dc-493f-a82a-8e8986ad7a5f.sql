-- PROMPT 06: Jornadas/Exercícios - Progresso e Filtros Otimizados

-- 1) Create materialized view for user progress aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_progress AS
SELECT 
  s.id as student_id,
  p.user_id,
  p.escola_id,
  COUNT(*) FILTER (WHERE sa.is_correct IS TRUE) AS acertos,
  COUNT(*) AS total_respostas,
  ROUND(100.0 * (COUNT(*) FILTER (WHERE sa.is_correct IS TRUE)) / NULLIF(COUNT(*), 0), 2) AS perc_acerto,
  COUNT(DISTINCT sa.exercise_id) AS exercicios_tentados,
  MAX(sa.answered_at) AS ultima_atividade
FROM students s
JOIN profiles p ON p.student_id = s.id
LEFT JOIN student_answers sa ON sa.student_id = s.id
WHERE s.ativo = true
GROUP BY s.id, p.user_id, p.escola_id;

-- 2) Add indexes on source tables for performance
CREATE INDEX IF NOT EXISTS idx_student_answers_student_correct ON student_answers (student_id, is_correct, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_answers_exercise_date ON student_answers (exercise_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_escola_ativo ON students (escola_id, ativo);
CREATE INDEX IF NOT EXISTS idx_profiles_student_escola ON profiles (student_id, escola_id);

-- 3) Create unique index on MV for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS mv_user_progress_unique_idx ON mv_user_progress (student_id);

-- 4) Revoke public access to MV
REVOKE ALL ON mv_user_progress FROM PUBLIC;

-- 5) Create security definer function to access MV data safely
CREATE OR REPLACE FUNCTION get_school_user_progress()
RETURNS TABLE(
  student_id uuid,
  user_id uuid,
  acertos bigint,
  total_respostas bigint,
  perc_acerto numeric,
  exercicios_tentados bigint,
  ultima_atividade timestamp with time zone
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_escola_id uuid;
  caller_role text;
BEGIN
  -- Get caller's identity
  SELECT v.escola_id, v.role 
  INTO caller_escola_id, caller_role
  FROM v_current_identity v
  LIMIT 1;
  
  -- Only allow school staff to access their school's data
  IF caller_role NOT IN ('admin', 'school_admin', 'coordinator') THEN
    RETURN;
  END IF;
  
  -- Return progress data filtered by school
  RETURN QUERY
  SELECT 
    mv.student_id,
    mv.user_id,
    mv.acertos,
    mv.total_respostas,
    mv.perc_acerto,
    mv.exercicios_tentados,
    mv.ultima_atividade
  FROM mv_user_progress mv
  WHERE mv.escola_id = caller_escola_id;
END;
$$;

-- 6) Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_mv_user_progress()
RETURNS void 
LANGUAGE sql 
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress;
$$;

-- 7) Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_school_user_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_mv_user_progress() TO service_role;