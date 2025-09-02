-- Complete the cleanup of remaining RLS policies

-- Aluno_tutor - drop all and recreate
DROP POLICY IF EXISTS "Aluno_tutor visível para admins" ON public.aluno_tutor;
DROP POLICY IF EXISTS "Admins podem gerenciar aluno_tutor" ON public.aluno_tutor;
DROP POLICY IF EXISTS "aluno_tutor_school_manage" ON public.aluno_tutor;
DROP POLICY IF EXISTS "aluno_tutor_school_read" ON public.aluno_tutor;
DROP POLICY IF EXISTS "Global admins can manage all tutor relationships" ON public.aluno_tutor;

CREATE POLICY "Aluno_tutor read admin" ON public.aluno_tutor FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Aluno_tutor admin manage" ON public.aluno_tutor FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Student_answers - drop all and recreate
DROP POLICY IF EXISTS "Student_answers visível para admins" ON public.student_answers;
DROP POLICY IF EXISTS "Admins podem gerenciar student_answers" ON public.student_answers;
DROP POLICY IF EXISTS "answers_owner_manage" ON public.student_answers;
DROP POLICY IF EXISTS "answers_owner_or_staff_read" ON public.student_answers;

CREATE POLICY "Student_answers read admin" ON public.student_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Student_answers admin manage" ON public.student_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Jornadas - drop all and recreate
DROP POLICY IF EXISTS "Jornadas visível para admins" ON public.jornadas;
DROP POLICY IF EXISTS "Admins podem gerenciar jornadas" ON public.jornadas;
DROP POLICY IF EXISTS "jornadas_owner_manage" ON public.jornadas;
DROP POLICY IF EXISTS "jornadas_owner_or_staff_read" ON public.jornadas;

CREATE POLICY "Jornadas read admin" ON public.jornadas FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Jornadas admin manage" ON public.jornadas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Student_question_responses - drop all and recreate
DROP POLICY IF EXISTS "Student_question_responses visível para admins" ON public.student_question_responses;
DROP POLICY IF EXISTS "Admins podem gerenciar student_question_responses" ON public.student_question_responses;
DROP POLICY IF EXISTS "responses_owner_manage" ON public.student_question_responses;

CREATE POLICY "Student_question_responses read admin" ON public.student_question_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Student_question_responses admin manage" ON public.student_question_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Redacoes_usuario - drop all and recreate
DROP POLICY IF EXISTS "Redacoes_usuario visível para admins" ON public.redacoes_usuario;
DROP POLICY IF EXISTS "Admins podem gerenciar redacoes_usuario" ON public.redacoes_usuario;
DROP POLICY IF EXISTS "redacoes_owner_manage" ON public.redacoes_usuario;
DROP POLICY IF EXISTS "redacoes_staff_read" ON public.redacoes_usuario;

CREATE POLICY "Redacoes_usuario read admin" ON public.redacoes_usuario FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Redacoes_usuario admin manage" ON public.redacoes_usuario FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);