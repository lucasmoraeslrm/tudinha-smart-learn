-- Criar função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  -- Buscar o user_id pelo email no auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN json_build_object(
      'error', 'Usuário não encontrado',
      'status', 'error'
    );
  END IF;
  
  -- Atualizar ou inserir no profiles
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

-- Garantir que existe uma escola padrão
INSERT INTO public.escolas (nome, codigo, cor_primaria, cor_secundaria, ativa, plano) 
VALUES ('Launs System', 'launs-system', '#3B82F6', '#1E40AF', true, 'enterprise')
ON CONFLICT (codigo) DO NOTHING;