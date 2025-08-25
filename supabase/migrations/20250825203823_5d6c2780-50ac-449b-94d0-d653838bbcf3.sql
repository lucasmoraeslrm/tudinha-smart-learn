-- Corrigir funções com search_path para evitar avisos de segurança

-- Recriar função get_professor_students com search_path
CREATE OR REPLACE FUNCTION public.get_professor_students(professor_codigo TEXT)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  student_ra TEXT,
  turma_nome TEXT,
  materia_nome TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    s.id as student_id,
    s.name as student_name,
    s.ra as student_ra,
    t.nome as turma_nome,
    m.nome as materia_nome
  FROM public.students s
  JOIN public.turmas t ON s.turma_id = t.id
  JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
  JOIN public.materias m ON pmt.materia_id = m.id
  JOIN public.professores p ON pmt.professor_id = p.id
  WHERE p.codigo = professor_codigo AND pmt.ativo = true;
END;
$$;

-- Recriar função professor_can_view_student com search_path
CREATE OR REPLACE FUNCTION public.professor_can_view_student(professor_codigo TEXT, student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.turmas t ON s.turma_id = t.id
    JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
    JOIN public.professores p ON pmt.professor_id = p.id
    WHERE p.codigo = professor_codigo 
    AND s.id = student_id 
    AND pmt.ativo = true
  );
END;
$$;

-- Recriar função update_updated_at_column com search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;