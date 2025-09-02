-- Fix ambiguous column references in login functions by qualifying escola_id

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
    -- Compare as hex(SHA-256) if that's how it was stored
    IF encode(digest(p_senha, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_prof, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$function$;

-- Also fix for coordenador login function
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
    IF encode(digest(p_senha, 'sha256'), 'hex') = v_hash THEN
      RETURN QUERY SELECT true, v_coord, v_escola;
    ELSE
      RETURN QUERY SELECT false, NULL::uuid, NULL::uuid;
    END IF;
  END IF;
END;
$function$;