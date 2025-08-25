-- Criar função para registrar usuário admin
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Admin Launs'
) 
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Inserir usuário no auth.users usando a API interna do Supabase
  -- Nota: Esta função é apenas para demonstração. 
  -- Na prática, o usuário deve se registrar via interface
  
  -- Por enquanto, vamos apenas preparar a estrutura para quando o usuário se registrar
  -- Vamos criar um registro placeholder que será atualizado quando o usuário fizer signup
  
  RETURN json_build_object(
    'message', 'Para criar conta admin, registre-se em /launs com seu email e depois execute: UPDATE profiles SET role = ''admin'' WHERE user_id = auth.uid();',
    'status', 'instructions'
  );
END;
$$;

-- Inserir um usuário admin temporário para demonstração
-- Este será substituído quando você fizer o signup real
INSERT OR IGNORE INTO public.profiles (
  user_id,
  full_name,
  role,
  escola_id
) VALUES (
  '00000000-0000-0000-0000-000000000000'::UUID,
  'Admin Launs (Temporário)',
  'admin',
  (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett')
) ON CONFLICT DO NOTHING;

-- Criar função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.promote_to_admin(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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