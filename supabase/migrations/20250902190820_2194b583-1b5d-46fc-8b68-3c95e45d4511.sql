-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Recreate login functions with proper digest usage
CREATE OR REPLACE FUNCTION public.verify_professor_login(p_login text, p_senha text)
 RETURNS TABLE(ok boolean, professor_id uuid, escola_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE 
  v_hash text;
  v_prof uuid;
  v_escola uuid;
BEGIN
  SELECT p.password_hash, p.id, p.escola_id
    INTO v_hash, v_prof, v_escola
  FROM public.professores p
  WHERE (lower(p.email) = lower(p_login) OR p.codigo = p_login)
    AND (p.ativo IS DISTINCT FROM false)  -- treat NULL as active
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
    -- Use encode with digest for SHA-256 comparison
    IF encode(digest(p_senha::text, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_prof, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_coordenador_login(p_login text, p_senha text)
 RETURNS TABLE(ok boolean, coordenador_id uuid, escola_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE 
  v_hash text;
  v_coord uuid;
  v_escola uuid;
BEGIN
  SELECT c.password_hash, c.id, c.escola_id
    INTO v_hash, v_coord, v_escola
  FROM public.coordenadores c
  WHERE (lower(c.email) = lower(p_login) OR c.codigo = p_login)
    AND (c.ativo IS DISTINCT FROM false)
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
    IF encode(digest(p_senha::text, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_coord, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_student_login(p_codigo text, p_senha text)
 RETURNS TABLE(ok boolean, student_id uuid, escola_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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

  IF encode(digest(p_senha::text, 'sha256'), 'hex') = v_hash THEN
    RETURN QUERY SELECT true, v_student, v_escola;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
  END IF;
END;
$function$;