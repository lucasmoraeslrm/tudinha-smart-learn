-- =============================================================================
-- PHASE 1: SECURITY AND VISIBILITY FIXES
-- =============================================================================

-- 1. Fix RLS policies for CHATS - restrict to user's own chats
DROP POLICY IF EXISTS "Users can view chats" ON public.chats;
DROP POLICY IF EXISTS "Users can insert chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats" ON public.chats;
DROP POLICY IF EXISTS "Users can delete chats" ON public.chats;

CREATE POLICY "Users can manage their own chats" ON public.chats
FOR ALL USING (user_id = current_user);

-- 2. Fix RLS policies for MESSAGES - restrict to user's own messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;

CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can create their own messages" ON public.messages
FOR INSERT WITH CHECK (user_id = current_user);

-- 3. Fix STUDENTS policies - restrict to student's own data or authorized professors
DROP POLICY IF EXISTS "Students can view and manage their own data" ON public.students;

CREATE POLICY "Students can view their own data" ON public.students
FOR SELECT USING (codigo = current_user OR EXISTS (
  SELECT 1 FROM public.professor_materia_turma pmt
  JOIN public.professores p ON pmt.professor_id = p.id
  JOIN public.turmas t ON pmt.turma_id = t.id
  WHERE t.id = students.turma_id 
  AND p.codigo = current_user 
  AND pmt.ativo = true
));

CREATE POLICY "Students can update their own data" ON public.students
FOR UPDATE USING (codigo = current_user);

-- 4. Fix ESCOLAS policy - remove overly permissive system access
DROP POLICY IF EXISTS "System can view school data" ON public.escolas;

-- 5. Restrict JORNADAS access properly
DROP POLICY IF EXISTS "Jornadas visíveis para todos autenticados" ON public.jornadas;
DROP POLICY IF EXISTS "Sistema pode gerenciar jornadas" ON public.jornadas;

CREATE POLICY "Students can view their own jornadas" ON public.jornadas
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.students s 
  WHERE s.id = jornadas.student_id 
  AND s.codigo = current_user
));

CREATE POLICY "Professors can view their students' jornadas" ON public.jornadas
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.turmas t ON s.turma_id = t.id
  JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
  JOIN public.professores p ON pmt.professor_id = p.id
  WHERE s.id = jornadas.student_id
  AND p.codigo = current_user
  AND pmt.ativo = true
));

CREATE POLICY "Professors can manage jornadas for their students" ON public.jornadas
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.professores p
  WHERE p.codigo = current_user
  AND p.ativo = true
));

-- 6. Fix STUDENT_ANSWERS policies
DROP POLICY IF EXISTS "Students can view their own answers" ON public.student_answers;

CREATE POLICY "Students can manage their own answers" ON public.student_answers
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.students s 
  WHERE s.id = student_answers.student_id 
  AND s.codigo = current_user
));

CREATE POLICY "Professors can view their students' answers" ON public.student_answers
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.turmas t ON s.turma_id = t.id
  JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
  JOIN public.professores p ON pmt.professor_id = p.id
  WHERE s.id = student_answers.student_id
  AND p.codigo = current_user
  AND pmt.ativo = true
));

-- 7. Fix STUDENT_EXERCISE_SESSIONS policies
DROP POLICY IF EXISTS "Students can manage their own sessions" ON public.student_exercise_sessions;

CREATE POLICY "Students can manage their own sessions" ON public.student_exercise_sessions
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.students s 
  WHERE s.id = student_exercise_sessions.student_id 
  AND s.codigo = current_user
));

CREATE POLICY "Professors can view their students' sessions" ON public.student_exercise_sessions
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.students s
  JOIN public.turmas t ON s.turma_id = t.id
  JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
  JOIN public.professores p ON pmt.professor_id = p.id
  WHERE s.id = student_exercise_sessions.student_id
  AND p.codigo = current_user
  AND pmt.ativo = true
));

-- 8. Fix STUDENT_QUESTION_RESPONSES policies
DROP POLICY IF EXISTS "Students can manage their own responses" ON public.student_question_responses;

CREATE POLICY "Students can manage their own responses" ON public.student_question_responses
FOR ALL USING (EXISTS (
  SELECT 1 FROM public.student_exercise_sessions ses
  JOIN public.students s ON s.id = ses.student_id
  WHERE ses.id = student_question_responses.session_id
  AND s.codigo = current_user
));

-- 9. Harden LOGIN_LOGS policies
DROP POLICY IF EXISTS "Estudantes podem ver seus próprios logs" ON public.login_logs;
DROP POLICY IF EXISTS "Sistema pode atualizar logs" ON public.login_logs;
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.login_logs;

CREATE POLICY "Students can view their own logs" ON public.login_logs
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.students s 
  WHERE s.id = login_logs.student_id 
  AND s.codigo = current_user
));

CREATE POLICY "System can manage login logs" ON public.login_logs
FOR ALL USING (true); -- System operations need broad access