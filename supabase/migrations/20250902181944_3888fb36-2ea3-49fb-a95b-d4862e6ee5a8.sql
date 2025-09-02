-- Add global admin policies for complete CRUD access to school data

-- Students table - Add global admin policy
CREATE POLICY "Global admins can manage all students" 
ON public.students 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Allow global admins to insert students
CREATE POLICY "Global admins can insert students"
ON public.students
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Allow global admins to delete students
CREATE POLICY "Global admins can delete students"
ON public.students
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Professores table - Add global admin policy (already has some, but ensure complete access)
CREATE POLICY "Global admins can read all professors"
ON public.professores
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Coordenadores table - Add global admin policy  
CREATE POLICY "Global admins can read all coordinators"
ON public.coordenadores
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Tutores table - Add global admin policy
CREATE POLICY "Global admins can read all tutors"
ON public.tutores
FOR SELECT  
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Turmas table - Add global admin manage policy and fix overly permissive policies
DROP POLICY IF EXISTS "Turmas visíveis para todos autenticados" ON public.turmas;

CREATE POLICY "Global admins can manage all turmas"
ON public.turmas
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- School staff can view/manage turmas from their school
CREATE POLICY "School staff can manage their school turmas"
ON public.turmas
FOR ALL
USING (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = turmas.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = turmas.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
));

-- Aluno_tutor table - Add global admin policy
CREATE POLICY "Global admins can manage all tutor relationships"
ON public.aluno_tutor
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.role = 'admin' 
  AND p.escola_id IS NULL
));

-- Update existing school staff policies to work alongside global admin policies

-- School staff can manage students from their school  
CREATE POLICY "School staff can manage their school students"
ON public.students
FOR ALL
USING (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = students.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = students.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
));

-- School staff can manage coordinators from their school
CREATE POLICY "School staff can manage coordinators from same school"
ON public.coordenadores  
FOR ALL
USING (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = coordenadores.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = coordenadores.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
));

-- School staff can manage tutors from their school
CREATE POLICY "School staff can manage tutors from same school"
ON public.tutores
FOR ALL
USING (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = tutores.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM v_current_identity v
  WHERE v.escola_id = tutores.escola_id 
  AND v.role IN ('school_admin', 'coordinator')
));