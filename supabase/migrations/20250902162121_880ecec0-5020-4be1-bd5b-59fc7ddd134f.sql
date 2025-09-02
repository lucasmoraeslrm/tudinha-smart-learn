-- =============================================================================
-- PHASE 3: STANDARDIZATION AND DEVELOPER EXPERIENCE - VIEWS
-- =============================================================================

-- Create standardized views for common queries to hide complexity and improve DX

-- 1. Professor with their assigned subjects and classes
CREATE OR REPLACE VIEW v_professor_materias_turmas AS
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

-- 2. Journey overview with student and school information
CREATE OR REPLACE VIEW v_jornadas_overview AS
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

-- 3. Exercises catalog with metadata
CREATE OR REPLACE VIEW v_exercises_catalog AS
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

-- 4. School users overview (all user types per school)
CREATE OR REPLACE VIEW v_escola_usuarios AS
SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  'professor' as tipo_usuario,
  p.id as usuario_id,
  p.nome as usuario_nome,
  p.codigo as usuario_codigo,
  p.email as usuario_email,
  p.ativo,
  p.created_at
FROM public.escolas e
JOIN public.professores p ON e.id = p.escola_id

UNION ALL

SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  'coordenador' as tipo_usuario,
  c.id as usuario_id,
  c.nome as usuario_nome,
  c.codigo as usuario_codigo,
  c.email as usuario_email,
  c.ativo,
  c.created_at
FROM public.escolas e
JOIN public.coordenadores c ON e.id = c.escola_id

UNION ALL

SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  'tutor' as tipo_usuario,
  t.id as usuario_id,
  t.nome as usuario_nome,
  NULL as usuario_codigo,
  t.email as usuario_email,
  t.ativo,
  t.created_at
FROM public.escolas e
JOIN public.tutores t ON e.id = t.escola_id

UNION ALL

SELECT 
  e.id as escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  'student' as tipo_usuario,
  s.id as usuario_id,
  s.name as usuario_nome,
  s.codigo as usuario_codigo,
  s.email as usuario_email,
  s.ativo,
  s.created_at
FROM public.escolas e
JOIN public.students s ON e.id = s.escola_id;

-- 5. Student performance summary
CREATE OR REPLACE VIEW v_student_performance AS
SELECT 
  s.id as student_id,
  s.name as student_nome,
  s.ra,
  s.codigo as student_codigo,
  t.nome as turma_nome,
  e.nome as escola_nome,
  COUNT(DISTINCT j.id) as total_jornadas,
  COUNT(DISTINCT CASE WHEN j.status = 'concluida' THEN j.id END) as jornadas_concluidas,
  COUNT(DISTINCT CASE WHEN j.status = 'em_andamento' THEN j.id END) as jornadas_em_andamento,
  COUNT(DISTINCT sa.id) as total_respostas,
  COUNT(DISTINCT CASE WHEN sa.is_correct THEN sa.id END) as respostas_corretas,
  CASE 
    WHEN COUNT(sa.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN sa.is_correct THEN 1 END)::decimal / COUNT(sa.id)) * 100, 2)
    ELSE 0 
  END as taxa_acerto_percent
FROM public.students s
LEFT JOIN public.turmas t ON s.turma_id = t.id
LEFT JOIN public.escolas e ON s.escola_id = e.id
LEFT JOIN public.jornadas j ON s.id = j.student_id
LEFT JOIN public.student_answers sa ON s.id = sa.student_id
GROUP BY s.id, s.name, s.ra, s.codigo, t.nome, e.nome;

-- Grant SELECT permissions on views to authenticated users
GRANT SELECT ON v_professor_materias_turmas TO authenticated;
GRANT SELECT ON v_jornadas_overview TO authenticated;
GRANT SELECT ON v_exercises_catalog TO authenticated;
GRANT SELECT ON v_escola_usuarios TO authenticated;
GRANT SELECT ON v_student_performance TO authenticated;