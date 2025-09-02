-- Fix security definer views - remove SECURITY DEFINER to inherit RLS
DROP VIEW IF EXISTS v_exercises_catalog;
CREATE VIEW v_exercises_catalog AS
SELECT 
  e.id as exercise_id,
  e.title,
  e.subject,
  e.question,
  e.correct_answer,
  e.explanation,
  e.difficulty,
  e.nivel_dificuldade,
  e.options,
  e.created_at,
  COUNT(sa.id) as total_attempts,
  COUNT(CASE WHEN sa.is_correct THEN 1 END) as correct_attempts,
  CASE 
    WHEN COUNT(sa.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN sa.is_correct THEN 1 END) * 100.0 / COUNT(sa.id)), 2)
    ELSE 0 
  END as success_rate_percent
FROM exercises e
LEFT JOIN student_answers sa ON e.id = sa.exercise_id
GROUP BY e.id, e.title, e.subject, e.question, e.correct_answer, e.explanation, e.difficulty, e.nivel_dificuldade, e.options, e.created_at;

DROP VIEW IF EXISTS v_jornadas_overview;
CREATE VIEW v_jornadas_overview AS
SELECT 
  j.id as jornada_id,
  j.student_id,
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
  CASE 
    WHEN j.exercise_ids IS NOT NULL THEN array_length(j.exercise_ids, 1)
    ELSE 0 
  END as total_exercicios,
  j.created_at as jornada_criada_em,
  s.name as student_nome,
  s.ra as student_ra,
  s.codigo as student_codigo,
  t.nome as turma_nome,
  t.serie,
  t.ano_letivo,
  e.nome as escola_nome,
  e.codigo as escola_codigo
FROM jornadas j
LEFT JOIN students s ON j.student_id = s.id
LEFT JOIN turmas t ON s.turma_id = t.id
LEFT JOIN escolas e ON s.escola_id = e.id;

DROP VIEW IF EXISTS v_professor_materias_turmas;
CREATE VIEW v_professor_materias_turmas AS
SELECT 
  pmt.professor_id,
  pmt.materia_id,
  pmt.turma_id,
  pmt.ativo,
  pmt.created_at as atribuicao_criada_em,
  p.nome as professor_nome,
  p.codigo as professor_codigo,
  p.email as professor_email,
  p.escola_id,
  e.nome as escola_nome,
  e.codigo as escola_codigo,
  m.nome as materia_nome,
  m.codigo as materia_codigo,
  t.nome as turma_nome,
  t.codigo as turma_codigo,
  t.serie,
  t.ano_letivo
FROM professor_materia_turma pmt
JOIN professores p ON pmt.professor_id = p.id
JOIN materias m ON pmt.materia_id = m.id
JOIN turmas t ON pmt.turma_id = t.id
JOIN escolas e ON p.escola_id = e.id;