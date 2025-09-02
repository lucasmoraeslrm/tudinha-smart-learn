-- Drop and recreate global admin policies to fix CRUD access

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Global admins can manage all students" ON public.students;
DROP POLICY IF EXISTS "Global admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Global admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Global admins can read all professors" ON public.professores;
DROP POLICY IF EXISTS "Global admins can read all coordinators" ON public.coordenadores;
DROP POLICY IF EXISTS "Global admins can read all tutors" ON public.tutores;
DROP POLICY IF EXISTS "Global admins can manage all turmas" ON public.turmas;
DROP POLICY IF EXISTS "School staff can manage their school turmas" ON public.turmas;
DROP POLICY IF EXISTS "Global admins can manage all tutor relationships" ON public.aluno_tutor;
DROP POLICY IF EXISTS "School staff can manage their school students" ON public.students;
DROP POLICY IF EXISTS "School staff can manage coordinators from same school" ON public.coordenadores;
DROP POLICY IF EXISTS "School staff can manage tutors from same school" ON public.tutores;

-- Students table - Complete CRUD for global admins
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

-- Professores table - Global admin complete access
CREATE POLICY "Global admins can manage all professors"
ON public.professores
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

-- Coordenadores table - Global admin complete access
CREATE POLICY "Global admins can manage all coordinators"
ON public.coordenadores
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

-- Tutores table - Global admin complete access
CREATE POLICY "Global admins can manage all tutors"
ON public.tutores
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

-- Turmas table - Global admin complete access
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

-- School staff can manage turmas from their school
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

-- Aluno_tutor table - Global admin complete access
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