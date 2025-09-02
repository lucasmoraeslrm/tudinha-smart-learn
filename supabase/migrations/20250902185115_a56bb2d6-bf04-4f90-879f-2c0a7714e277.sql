-- Revert all RLS policies to original version without v_current_identity

-- Drop and recreate materias policies
DROP POLICY IF EXISTS "School admins/coordinators can manage materias for their school" ON public.materias;
DROP POLICY IF EXISTS "Launs admins can manage all materias" ON public.materias;

CREATE POLICY "Materias visíveis para todos autenticados" 
ON public.materias 
FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar materias" 
ON public.materias 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate turmas policies
DROP POLICY IF EXISTS "School staff can manage their school turmas" ON public.turmas;
DROP POLICY IF EXISTS "Global admins can manage all turmas" ON public.turmas;
DROP POLICY IF EXISTS "Admins podem gerenciar turmas" ON public.turmas;

CREATE POLICY "Turmas visíveis para admins" 
ON public.turmas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar turmas" 
ON public.turmas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate tutores policies
DROP POLICY IF EXISTS "tutores_school_manage" ON public.tutores;
DROP POLICY IF EXISTS "tutores_self_or_school" ON public.tutores;
DROP POLICY IF EXISTS "School staff can manage tutors from same school" ON public.tutores;
DROP POLICY IF EXISTS "Global admins can manage all tutors" ON public.tutores;

CREATE POLICY "Tutores visíveis para admins" 
ON public.tutores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar tutores" 
ON public.tutores 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate aluno_tutor policies
DROP POLICY IF EXISTS "aluno_tutor_school_manage" ON public.aluno_tutor;
DROP POLICY IF EXISTS "aluno_tutor_school_read" ON public.aluno_tutor;
DROP POLICY IF EXISTS "Global admins can manage all tutor relationships" ON public.aluno_tutor;

CREATE POLICY "Aluno_tutor visível para admins" 
ON public.aluno_tutor 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar aluno_tutor" 
ON public.aluno_tutor 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate student_answers policies
DROP POLICY IF EXISTS "answers_owner_manage" ON public.student_answers;
DROP POLICY IF EXISTS "answers_owner_or_staff_read" ON public.student_answers;

CREATE POLICY "Student_answers visível para admins" 
ON public.student_answers 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar student_answers" 
ON public.student_answers 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate jornadas policies
DROP POLICY IF EXISTS "jornadas_owner_manage" ON public.jornadas;
DROP POLICY IF EXISTS "jornadas_owner_or_staff_read" ON public.jornadas;

CREATE POLICY "Jornadas visível para admins" 
ON public.jornadas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar jornadas" 
ON public.jornadas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate student_question_responses policies
DROP POLICY IF EXISTS "responses_owner_manage" ON public.student_question_responses;

CREATE POLICY "Student_question_responses visível para admins" 
ON public.student_question_responses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar student_question_responses" 
ON public.student_question_responses 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop and recreate redacoes_usuario policies
DROP POLICY IF EXISTS "redacoes_owner_manage" ON public.redacoes_usuario;
DROP POLICY IF EXISTS "redacoes_staff_read" ON public.redacoes_usuario;

CREATE POLICY "Redacoes_usuario visível para admins" 
ON public.redacoes_usuario 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar redacoes_usuario" 
ON public.redacoes_usuario 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));