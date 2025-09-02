-- Fix verify_professor_password function to remove non-existent materias field
CREATE OR REPLACE FUNCTION public.verify_professor_password(input_codigo text, input_password text)
 RETURNS TABLE(professor_data json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;