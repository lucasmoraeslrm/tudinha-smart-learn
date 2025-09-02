-- =============================================================================
-- SUPABASE DATABASE SCHEMA SNAPSHOT
-- Generated: 2025-01-13
-- Project: pwdkfekouyyujfwmgqls
-- =============================================================================

-- =============================================================================
-- TABLES
-- =============================================================================

-- Schools table
CREATE TABLE public.escolas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativa boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  dominio text,
  logo_url text,
  cor_primaria text DEFAULT '#3B82F6'::text,
  cor_secundaria text DEFAULT '#1E40AF'::text,
  plano text NOT NULL DEFAULT 'basico'::text,
  nome_fantasia text,
  razao_social text,
  telefone text,
  celular text,
  endereco text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  cep text,
  email text,
  nome text NOT NULL,
  codigo text NOT NULL,
  PRIMARY KEY (id)
);

-- Modules table
CREATE TABLE public.modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nome text NOT NULL,
  codigo text NOT NULL,
  descricao text,
  icone text,
  PRIMARY KEY (id)
);

-- School modules relationship
CREATE TABLE public.escola_modulos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  escola_id uuid NOT NULL,
  modulo_id uuid NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  configuracoes jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Series and school years
CREATE TABLE public.series_anos_letivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  escola_id uuid NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  serie text NOT NULL,
  ano_letivo text NOT NULL,
  PRIMARY KEY (id)
);

-- Subjects table
CREATE TABLE public.materias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT true,
  escola_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nome text NOT NULL,
  codigo text NOT NULL,
  descricao text,
  PRIMARY KEY (id)
);

-- Classes table
CREATE TABLE public.turmas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT true,
  escola_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nome text NOT NULL,
  codigo text NOT NULL,
  serie text NOT NULL,
  ano_letivo text NOT NULL,
  PRIMARY KEY (id)
);

-- Professors table
CREATE TABLE public.professores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  escola_id uuid,
  nome text NOT NULL,
  email text,
  codigo text NOT NULL,
  password_hash text NOT NULL,
  PRIMARY KEY (id)
);

-- Coordinators table
CREATE TABLE public.coordenadores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  escola_id uuid,
  permissoes jsonb DEFAULT '{"financeiro": false, "acesso_total": false, "cadastro_aluno": false, "cadastro_professor": false}'::jsonb,
  nome text NOT NULL,
  email text,
  codigo text NOT NULL,
  password_hash text NOT NULL,
  funcao text NOT NULL,
  PRIMARY KEY (id)
);

-- Tutors table
CREATE TABLE public.tutores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT true,
  escola_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text,
  password_hash text NOT NULL,
  tipo text NOT NULL,
  telefone text,
  PRIMARY KEY (id)
);

-- Students table
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  age integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  escola_id uuid,
  turma_id uuid,
  data_nascimento date,
  ativo boolean NOT NULL DEFAULT true,
  name text NOT NULL,
  email text,
  codigo text,
  ano_letivo text,
  turma text,
  maquina_padrao text,
  ra text,
  password_hash text,
  PRIMARY KEY (id)
);

-- Student authentication
CREATE TABLE public.student_auth (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  password_hash text NOT NULL,
  codigo text NOT NULL,
  PRIMARY KEY (id)
);

-- Professor-Subject-Class assignments
CREATE TABLE public.professor_materia_turma (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid,
  materia_id uuid,
  turma_id uuid,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Student-Tutor relationship
CREATE TABLE public.aluno_tutor (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  aluno_id uuid,
  tutor_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Scheduled classes
CREATE TABLE public.aulas_programadas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid,
  data_hora_inicio timestamp with time zone NOT NULL,
  data_hora_fim timestamp with time zone NOT NULL,
  duracao_minutos integer DEFAULT 40,
  ativa boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  titulo text NOT NULL,
  materia text NOT NULL,
  assunto text,
  turma text,
  PRIMARY KEY (id)
);

-- Learning journeys
CREATE TABLE public.jornadas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  inicio_previsto timestamp with time zone,
  fim_previsto timestamp with time zone,
  inicio_real timestamp with time zone,
  fim_real timestamp with time zone,
  tempo_resumo_segundos integer,
  resultado_exercicio jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise_ids uuid[] DEFAULT '{}'::uuid[],
  aula_titulo text NOT NULL,
  professor_nome text,
  materia text NOT NULL,
  assunto text,
  status text DEFAULT 'pendente'::text,
  resumo_inicial text,
  serie_ano_letivo text,
  serie_turma text,
  PRIMARY KEY (id)
);

-- Exercise collections
CREATE TABLE public.exercise_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  materia text NOT NULL,
  serie_escolar text NOT NULL,
  PRIMARY KEY (id)
);

-- Exercise topics
CREATE TABLE public.exercise_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL,
  ordem integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  assunto text NOT NULL,
  PRIMARY KEY (id)
);

-- Topic exercises
CREATE TABLE public.topic_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  alternativas jsonb NOT NULL,
  ordem integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resposta_correta text NOT NULL,
  explicacao text,
  enunciado text NOT NULL,
  PRIMARY KEY (id)
);

-- Exercises table
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  options jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  subject text NOT NULL,
  question text NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  difficulty text DEFAULT 'medium'::text,
  nivel_dificuldade text DEFAULT 'medio'::text,
  PRIMARY KEY (id)
);

-- Exercise lists
CREATE TABLE public.exercise_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exercise_ids uuid[] NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  difficulty text DEFAULT 'medium'::text,
  PRIMARY KEY (id)
);

-- Journey exercises
CREATE TABLE public.jornada_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  options jsonb,
  ordem integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  question text NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  subject text NOT NULL,
  difficulty text DEFAULT 'medium'::text,
  PRIMARY KEY (id)
);

-- Student answers
CREATE TABLE public.student_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  exercise_id uuid,
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  list_id uuid,
  user_answer text NOT NULL,
  PRIMARY KEY (id)
);

-- Student exercise sessions
CREATE TABLE public.student_exercise_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  total_time_seconds integer,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 5,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Student question responses
CREATE TABLE public.student_question_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  is_correct boolean NOT NULL,
  time_spent_seconds integer NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  student_answer text NOT NULL,
  PRIMARY KEY (id)
);

-- Machines table
CREATE TABLE public.maquinas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  codigo text NOT NULL,
  nome text,
  ip_address text,
  status text DEFAULT 'disponivel'::text,
  PRIMARY KEY (id)
);

-- Login logs
CREATE TABLE public.login_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  login_time timestamp with time zone NOT NULL DEFAULT now(),
  logout_time timestamp with time zone,
  maquina_codigo text,
  ip_address text,
  status text DEFAULT 'ativo'::text,
  PRIMARY KEY (id)
);

-- User profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  student_id uuid,
  escola_id uuid,
  full_name text,
  role text NOT NULL DEFAULT 'student'::text,
  codigo text,
  ano_letivo text,
  turma text,
  PRIMARY KEY (id)
);

-- Chats table
CREATE TABLE public.chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone,
  deleted_at timestamp with time zone,
  user_id text NOT NULL,
  title text NOT NULL DEFAULT 'Novo chat'::text,
  PRIMARY KEY (id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  chat_id uuid,
  user_id text NOT NULL,
  session_id text NOT NULL,
  message text NOT NULL,
  sender text NOT NULL,
  attachment_url text,
  attachment_type text,
  attachment_name text,
  PRIMARY KEY (id)
);

-- Admin chat logs
CREATE TABLE public.admin_chat_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  admin_message text NOT NULL,
  ai_response text NOT NULL,
  PRIMARY KEY (id)
);

-- Webhooks table
CREATE TABLE public.webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT true,
  modo_producao boolean NOT NULL DEFAULT false,
  escola_id uuid,
  headers jsonb DEFAULT '{}'::jsonb,
  configuracoes jsonb DEFAULT '{}'::jsonb,
  ultimo_disparo timestamp with time zone,
  total_disparos integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tipo text NOT NULL,
  url_teste text NOT NULL,
  url_producao text NOT NULL,
  ultimo_status text,
  nome text NOT NULL,
  PRIMARY KEY (id)
);

-- N8N Journey Interactions
CREATE TABLE public.interacoes_jornada_n8n (
  id bigint NOT NULL,
  jornada_id uuid,
  criada_em timestamp without time zone DEFAULT now(),
  etapa text NOT NULL,
  mensagem_aluno text,
  mensagem_professor text,
  resposta_ia text,
  PRIMARY KEY (id)
);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, codigo, ano_letivo, turma)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'codigo',
    NEW.raw_user_meta_data->>'ano_letivo', 
    NEW.raw_user_meta_data->>'turma'
  );
  RETURN NEW;
END;
$$;

-- Update profiles timestamp
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Set chats last message timestamp
CREATE OR REPLACE FUNCTION public.set_chats_last_message_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.chat_id IS NOT NULL THEN
    UPDATE public.chats
    SET last_message_at = now(),
        updated_at = now()
    WHERE id = NEW.chat_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Promote user to admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'error', 'Usuário não encontrado',
      'status', 'error'
    );
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, role, escola_id)
  VALUES (
    target_user_id,
    (SELECT COALESCE(raw_user_meta_data->>'full_name', email) FROM auth.users WHERE id = target_user_id),
    'admin',
    (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett')
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'admin',
    updated_at = now();
    
  RETURN json_build_object(
    'message', 'Usuário promovido a admin com sucesso',
    'user_id', target_user_id,
    'status', 'success'
  );
END;
$$;

-- Get professor students
CREATE OR REPLACE FUNCTION public.get_professor_students(professor_codigo text)
RETURNS TABLE(student_id uuid, student_name text, student_ra text, turma_nome text, materia_nome text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Check if professor can view student
CREATE OR REPLACE FUNCTION public.professor_can_view_student(professor_codigo text, student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Check if professor-subject-class is from same school
CREATE OR REPLACE FUNCTION public.pmt_is_same_school(_professor_id uuid, _materia_id uuid, _turma_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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

-- Verify student password (SECURITY ISSUE: Returns password_hash)
CREATE OR REPLACE FUNCTION public.verify_student_password(input_codigo text, input_password text)
RETURNS TABLE(student_data json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_record RECORD;
  student_record RECORD;
BEGIN
  SELECT * INTO auth_record 
  FROM public.student_auth 
  WHERE codigo = input_codigo;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  SELECT s.*, p.full_name, p.role 
  INTO student_record
  FROM public.students s
  LEFT JOIN public.profiles p ON p.student_id = s.id
  WHERE s.id = auth_record.student_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', student_record.id,
      'codigo', auth_record.codigo,
      'name', student_record.name,
      'full_name', student_record.full_name,
      'ano_letivo', student_record.ano_letivo,
      'turma', student_record.turma,
      'password_hash', auth_record.password_hash,
      'role', COALESCE(student_record.role, 'student')
    );
  END IF;
END;
$$;

-- Verify coordinator password (SECURITY ISSUE: Returns password_hash)
CREATE OR REPLACE FUNCTION public.verify_coordenador_password(input_codigo text, input_password text)
RETURNS TABLE(coordenador_data json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coord_record RECORD;
BEGIN
  SELECT * INTO coord_record 
  FROM public.coordenadores 
  WHERE codigo = input_codigo AND ativo = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', coord_record.id,
      'nome', coord_record.nome,
      'codigo', coord_record.codigo,
      'funcao', coord_record.funcao,
      'password_hash', coord_record.password_hash
    );
  END IF;
END;
$$;

-- Verify professor password (SECURITY ISSUE: Returns password_hash)
CREATE OR REPLACE FUNCTION public.verify_professor_password(input_codigo text, input_password text)
RETURNS TABLE(professor_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  professor_record RECORD;
BEGIN
  SELECT * INTO professor_record 
  FROM public.professores 
  WHERE codigo = input_codigo AND ativo = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', professor_record.id,
      'nome', professor_record.nome,
      'codigo', professor_record.codigo,
      'email', professor_record.email,
      'escola_id', professor_record.escola_id,
      'password_hash', professor_record.password_hash
    );
  END IF;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_anos_letivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_materia_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas_programadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Current RLS policies (many too permissive - marked with SECURITY ISSUE)

-- ESCOLAS policies
CREATE POLICY "Launs admins can manage schools" ON public.escolas FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "School users can view their own school" ON public.escolas FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.escola_id = escolas.id AND p.role = ANY (ARRAY['school_admin', 'coordinator'])));
CREATE POLICY "System can view school data" ON public.escolas FOR SELECT USING (true); -- SECURITY ISSUE: Too permissive

-- CHATS policies (SECURITY ISSUE: No user restriction)
CREATE POLICY "Users can view chats" ON public.chats FOR SELECT USING (true);
CREATE POLICY "Users can insert chats" ON public.chats FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update chats" ON public.chats FOR UPDATE USING (true);
CREATE POLICY "Users can delete chats" ON public.chats FOR DELETE USING (true);

-- MESSAGES policies (SECURITY ISSUE: No user restriction)
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Users can create messages" ON public.messages FOR INSERT WITH CHECK (true);

-- STUDENTS policies (SECURITY ISSUE: Too permissive)
CREATE POLICY "Students can view and manage their own data" ON public.students FOR ALL USING (true);

-- And many more overly permissive policies...

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================

-- Chat uploads bucket (public)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-uploads', 'chat-uploads', true);

-- =============================================================================
-- EDGE FUNCTIONS
-- =============================================================================

-- Available Edge Functions:
-- - admin-chat
-- - provision-coordinator-auth  
-- - send-n8n-webhook
-- - student-auth

-- =============================================================================
-- CRITICAL SECURITY ISSUES IDENTIFIED
-- =============================================================================

-- 1. RLS Policies too permissive (many using "true" condition)
-- 2. Password hashes returned in RPC functions
-- 3. Missing foreign key constraints
-- 4. No unique constraints on critical fields
-- 5. Mixed language naming (Portuguese/English)
-- 6. Missing indexes for performance
-- 7. No proper audit trail
-- 8. Chat/Messages system completely open

-- =============================================================================
-- END OF SCHEMA SNAPSHOT
-- =============================================================================