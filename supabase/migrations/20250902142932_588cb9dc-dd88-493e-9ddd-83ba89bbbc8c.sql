-- Grant school admins/coordinators ability to manage professor_materia_turma for their school
-- 1) Helper function to ensure the PMT row belongs to the same school as the current user
CREATE OR REPLACE FUNCTION public.pmt_is_same_school(_professor_id uuid, _materia_id uuid, _turma_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_escola uuid;
  prof_escola uuid;
  mat_escola uuid;
  turma_escola uuid;
BEGIN
  SELECT escola_id INTO user_escola FROM public.profiles WHERE user_id = auth.uid();
  IF user_escola IS NULL THEN RETURN FALSE; END IF;

  IF _professor_id IS NOT NULL THEN
    SELECT escola_id INTO prof_escola FROM public.professores WHERE id = _professor_id;
    IF prof_escola IS NULL OR prof_escola <> user_escola THEN RETURN FALSE; END IF;
  END IF;

  IF _materia_id IS NOT NULL THEN
    SELECT escola_id INTO mat_escola FROM public.materias WHERE id = _materia_id;
    IF mat_escola IS NULL OR mat_escola <> user_escola THEN RETURN FALSE; END IF;
  END IF;

  IF _turma_id IS NOT NULL THEN
    SELECT escola_id INTO turma_escola FROM public.turmas WHERE id = _turma_id;
    IF turma_escola IS NULL OR turma_escola <> user_escola THEN RETURN FALSE; END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- 2) Policies for INSERT/UPDATE/DELETE on professor_materia_turma
DROP POLICY IF EXISTS "School admins/coordinators can insert PMT for their school" ON public.professor_materia_turma;
CREATE POLICY "School admins/coordinators can insert PMT for their school"
ON public.professor_materia_turma
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('school_admin','coordinator')
  ) AND public.pmt_is_same_school(professor_id, materia_id, turma_id)
);

DROP POLICY IF EXISTS "School admins/coordinators can update PMT for their school" ON public.professor_materia_turma;
CREATE POLICY "School admins/coordinators can update PMT for their school"
ON public.professor_materia_turma
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('school_admin','coordinator')
  ) AND public.pmt_is_same_school(professor_id, materia_id, turma_id)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('school_admin','coordinator')
  ) AND public.pmt_is_same_school(professor_id, materia_id, turma_id)
);

DROP POLICY IF EXISTS "School admins/coordinators can delete PMT for their school" ON public.professor_materia_turma;
CREATE POLICY "School admins/coordinators can delete PMT for their school"
ON public.professor_materia_turma
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role IN ('school_admin','coordinator')
  ) AND public.pmt_is_same_school(professor_id, materia_id, turma_id)
);
