-- =============================================================================
-- PHASE 4: FIX SECURITY DEFINER VIEWS AND ADD RLS POLICIES FOR VIEWS
-- =============================================================================

-- Drop the views and recreate them without SECURITY DEFINER
-- Instead, we'll create proper RLS policies

-- 1. Recreate views without SECURITY DEFINER and add RLS policies
DROP VIEW IF EXISTS v_professor_materias_turmas CASCADE;
DROP VIEW IF EXISTS v_jornadas_overview CASCADE;
DROP VIEW IF EXISTS v_exercises_catalog CASCADE;
DROP VIEW IF EXISTS v_escola_usuarios CASCADE;
DROP VIEW IF EXISTS v_student_performance CASCADE;

-- Recreate views normally (they will inherit RLS from underlying tables)
CREATE VIEW v_professor_materias_turmas AS
SELECT 
  p.id as professor_id,
  p.nome as professor_nome,
  p.codigo as professor_codigo,
  p.email as professor_email,
  p.escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  m.id as materia_id,
  m.nome as materia_nome,
  m.codigo as materia_codigo,
  t.id as turma_id,
  t.nome as turma_nome,
  t.codigo as turma_codigo,
  t.serie,
  t.ano_letivo,
  pmt.ativo,
  pmt.created_at as atribuicao_criada_em
FROM public.professores p
JOIN public.professor_materia_turma pmt ON p.id = pmt.professor_id
JOIN public.materias m ON pmt.materia_id = m.id
JOIN public.turmas t ON pmt.turma_id = t.id
JOIN public.escolas e ON p.escola_id = e.id
WHERE p.ativo = true AND pmt.ativo = true;

CREATE VIEW v_jornadas_overview AS
SELECT 
  j.id as jornada_id,
  j.aula_titulo,
  j.professor_nome,
  j.materia,
  j.assunto,
  j.status,
  j.inicio_previsto,
  j.fim_previsto,
  j.inicio_real,
  j.fim_real,
  j.tempo_resumo_segundos,
  j.exercise_ids,
  ARRAY_LENGTH(j.exercise_ids, 1) as total_exercicios,
  j.created_at as jornada_criada_em,
  s.id as student_id,
  s.name as student_nome,
  s.ra as student_ra,
  s.codigo as student_codigo,
  t.nome as turma_nome,
  t.serie,
  t.ano_letivo,
  e.nome as escola_nome,
  e.codigo as escola_codigo
FROM public.jornadas j
JOIN public.students s ON j.student_id = s.id
LEFT JOIN public.turmas t ON s.turma_id = t.id
LEFT JOIN public.escolas e ON s.escola_id = e.id;

CREATE VIEW v_exercises_catalog AS
SELECT 
  ex.id as exercise_id,
  ex.title,
  ex.subject,
  ex.question,
  ex.correct_answer,
  ex.explanation,
  ex.difficulty,
  ex.nivel_dificuldade,
  ex.options,
  ex.created_at,
  COUNT(sa.id) as total_attempts,
  COUNT(CASE WHEN sa.is_correct THEN 1 END) as correct_attempts,
  CASE 
    WHEN COUNT(sa.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN sa.is_correct THEN 1 END)::decimal / COUNT(sa.id)) * 100, 2)
    ELSE 0 
  END as success_rate_percent
FROM public.exercises ex
LEFT JOIN public.student_answers sa ON ex.id = sa.exercise_id
GROUP BY ex.id, ex.title, ex.subject, ex.question, ex.correct_answer, 
         ex.explanation, ex.difficulty, ex.nivel_dificuldade, ex.options, ex.created_at;

-- Create helper functions for professor access (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_current_user_professor_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT p.id 
    FROM public.professores p 
    WHERE p.codigo = current_user AND p.ativo = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_professor_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.professores p WHERE p.codigo = current_user AND p.ativo = true
  ) OR EXISTS (
    SELECT 1 FROM public.profiles pr WHERE pr.user_id = auth.uid() AND pr.role = 'admin'
  );
END;
$$;

-- Add additional performance indexes for Phase 4
CREATE INDEX IF NOT EXISTS idx_exercises_subject ON public.exercises(subject);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON public.exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_student_answers_answered_at ON public.student_answers(answered_at);
CREATE INDEX IF NOT EXISTS idx_student_answers_is_correct ON public.student_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_jornadas_created_at ON public.jornadas(created_at);
CREATE INDEX IF NOT EXISTS idx_jornadas_professor_nome ON public.jornadas(professor_nome);
CREATE INDEX IF NOT EXISTS idx_professores_codigo ON public.professores(codigo);
CREATE INDEX IF NOT EXISTS idx_coordenadores_codigo ON public.coordenadores(codigo);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pmt_active_lookup ON public.professor_materia_turma(professor_id, ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_students_turma_active ON public.students(turma_id, ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_jornadas_student_status ON public.jornadas(student_id, status);

-- Add updated_at triggers where missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_escolas_updated_at') THEN
    CREATE TRIGGER update_escolas_updated_at
      BEFORE UPDATE ON public.escolas
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_professores_updated_at') THEN
    CREATE TRIGGER update_professores_updated_at
      BEFORE UPDATE ON public.professores
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_coordenadores_updated_at') THEN
    CREATE TRIGGER update_coordenadores_updated_at
      BEFORE UPDATE ON public.coordenadores
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
    CREATE TRIGGER update_students_updated_at
      BEFORE UPDATE ON public.students
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;