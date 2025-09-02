
-- Ensure pgcrypto is available for crypt() and digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Secure login function for Professors (email OR codigo)
CREATE OR REPLACE FUNCTION public.verify_professor_login(p_login text, p_senha text)
RETURNS TABLE(ok boolean, professor_id uuid, escola_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_hash text;
  v_prof uuid;
  v_escola uuid;
BEGIN
  SELECT password_hash, id, escola_id
    INTO v_hash, v_prof, v_escola
  FROM public.professores
  WHERE (lower(email) = lower(p_login) OR codigo = p_login)
    AND (ativo IS DISTINCT FROM false)  -- treat NULL as active
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  -- Prefer bcrypt/crypt if formatted; fallback to sha256 hex if needed
  IF v_hash LIKE '$%' THEN
    IF crypt(p_senha, v_hash) = v_hash THEN
      RETURN QUERY SELECT true, v_prof, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  ELSE
    -- Compare as hex(SHA-256) if that's how it was stored
    IF encode(digest(p_senha, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_prof, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$$;

-- 2) Secure login function for Coordinators (email OR codigo)
CREATE OR REPLACE FUNCTION public.verify_coordenador_login(p_login text, p_senha text)
RETURNS TABLE(ok boolean, coordenador_id uuid, escola_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_hash text;
  v_coord uuid;
  v_escola uuid;
BEGIN
  SELECT password_hash, id, escola_id
    INTO v_hash, v_coord, v_escola
  FROM public.coordenadores
  WHERE (lower(email) = lower(p_login) OR codigo = p_login)
    AND (ativo IS DISTINCT FROM false)
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  IF v_hash LIKE '$%' THEN
    IF crypt(p_senha, v_hash) = v_hash THEN
      RETURN QUERY SELECT true, v_coord, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  ELSE
    IF encode(digest(p_senha, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_coord, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$$;

-- 3) Secure login function for Students (codigo only, via student_auth)
-- Assumes student_auth.password_hash is hex-encoded SHA-256
CREATE OR REPLACE FUNCTION public.verify_student_login(p_codigo text, p_senha text)
RETURNS TABLE(ok boolean, student_id uuid, escola_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_hash text;
  v_student uuid;
  v_escola uuid;
BEGIN
  SELECT sa.password_hash, sa.student_id, s.escola_id
    INTO v_hash, v_student, v_escola
  FROM public.student_auth sa
  JOIN public.students s ON s.id = sa.student_id
  WHERE sa.codigo = p_codigo
    AND (s.ativo IS DISTINCT FROM false)
  LIMIT 1;

  IF v_hash IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    RETURN;
  END IF;

  IF encode(digest(p_senha, 'sha256'), 'hex') = v_hash THEN
    RETURN QUERY SELECT true, v_student, v_escola;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
  END IF;
END;
$$;

-- 4) Legacy wrappers updated to be secure and call the new functions
-- 4a) Professors (keeps current frontend RPC contract)
CREATE OR REPLACE FUNCTION public.verify_professor_password(input_codigo text, input_password text)
RETURNS TABLE(professor_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_ok boolean;
  v_prof uuid;
  v_escola uuid;
BEGIN
  SELECT ok, professor_id, escola_id
    INTO v_ok, v_prof, v_escola
  FROM public.verify_professor_login(input_codigo, input_password);

  IF v_ok THEN
    RETURN QUERY
      SELECT json_build_object(
        'id', v_prof,
        'nome', (SELECT nome FROM public.professores WHERE id = v_prof),
        'codigo', input_codigo,
        'email', (SELECT email FROM public.professores WHERE id = v_prof),
        'escola_id', v_escola
      );
  ELSE
    RETURN; -- no rows => invalid credentials
  END IF;
END;
$$;

-- 4b) Coordinators (keeps current frontend RPC contract)
CREATE OR REPLACE FUNCTION public.verify_coordenador_password(input_codigo text, input_password text)
RETURNS TABLE(coordenador_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_ok boolean;
  v_coord uuid;
  v_escola uuid;
BEGIN
  SELECT ok, coordenador_id, escola_id
    INTO v_ok, v_coord, v_escola
  FROM public.verify_coordenador_login(input_codigo, input_password);

  IF v_ok THEN
    RETURN QUERY
      SELECT json_build_object(
        'id', v_coord,
        'nome', (SELECT nome FROM public.coordenadores WHERE id = v_coord),
        'codigo', input_codigo,
        'funcao', (SELECT funcao FROM public.coordenadores WHERE id = v_coord),
        'escola_id', v_escola
      );
  ELSE
    RETURN;
  END IF;
END;
$$;

-- 4c) Students (tighten to verify password here and only return on success)
CREATE OR REPLACE FUNCTION public.verify_student_password(input_codigo text, input_password text)
RETURNS TABLE(student_data json)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE 
  v_ok boolean;
  v_student uuid;
  v_escola uuid;
BEGIN
  SELECT ok, student_id, escola_id
    INTO v_ok, v_student, v_escola
  FROM public.verify_student_login(input_codigo, input_password);

  IF v_ok THEN
    RETURN QUERY
      SELECT json_build_object(
        'id', s.id,
        'codigo', sa.codigo,
        'name', s.name,
        'full_name', p.full_name,
        'ano_letivo', s.ano_letivo,
        'turma', s.turma,
        'escola_id', s.escola_id,
        'role', COALESCE(p.role, 'student')
      )
      FROM public.student_auth sa
      JOIN public.students s ON s.id = sa.student_id
      LEFT JOIN public.profiles p ON p.student_id = s.id
      WHERE sa.student_id = v_student
      LIMIT 1;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- 5) Tighten privileges: prevent selecting password_hash columns; allow only executing functions
-- Column-level REVOKE for password_hash across main tables (idempotent via guards)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema='public' AND table_name='professores' AND column_name='password_hash'
  ) THEN
    EXECUTE 'REVOKE SELECT (password_hash) ON TABLE public.professores FROM authenticated, anon';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema='public' AND table_name='coordenadores' AND column_name='password_hash'
  ) THEN
    EXECUTE 'REVOKE SELECT (password_hash) ON TABLE public.coordenadores FROM authenticated, anon';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema='public' AND table_name='students' AND column_name='password_hash'
  ) THEN
    EXECUTE 'REVOKE SELECT (password_hash) ON TABLE public.students FROM authenticated, anon';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
     WHERE table_schema='public' AND table_name='tutores' AND column_name='password_hash'
  ) THEN
    EXECUTE 'REVOKE SELECT (password_hash) ON TABLE public.tutores FROM authenticated, anon';
  END IF;

  -- Fully hide student_auth from anon/authenticated (functions run as SECURITY DEFINER)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
     WHERE table_schema='public' AND table_name='student_auth'
  ) THEN
    EXECUTE 'REVOKE ALL ON TABLE public.student_auth FROM authenticated, anon';
  END IF;
END
$$;

-- 6) Grant minimal function EXECUTE permissions for login flows
DO $$
BEGIN
  -- New secure functions
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_professor_login(text, text) TO anon, authenticated, service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_coordenador_login(text, text) TO anon, authenticated, service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_student_login(text, text) TO anon, authenticated, service_role';

  -- Legacy wrappers (still used by frontend)
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_professor_password(text, text) TO anon, authenticated, service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_coordenador_password(text, text) TO anon, authenticated, service_role';
  EXECUTE 'GRANT EXECUTE ON FUNCTION public.verify_student_password(text, text) TO anon, authenticated, service_role';
END
$$;

-- Optional: comments for clarity
COMMENT ON FUNCTION public.verify_professor_login(text, text) IS 'Secure professor login (email or codigo). No hash exposure.';
COMMENT ON FUNCTION public.verify_coordenador_login(text, text) IS 'Secure coordinator login (email or codigo). No hash exposure.';
COMMENT ON FUNCTION public.verify_student_login(text, text) IS 'Secure student login via student_auth (codigo only). No hash exposure.';
