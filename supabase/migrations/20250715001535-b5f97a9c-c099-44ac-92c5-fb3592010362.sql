-- Adicionar novos campos na tabela profiles para alunos
ALTER TABLE public.profiles 
ADD COLUMN codigo TEXT UNIQUE,
ADD COLUMN ano_letivo TEXT,
ADD COLUMN turma TEXT;

-- Criar índice para busca rápida por código
CREATE INDEX idx_profiles_codigo ON public.profiles(codigo) WHERE codigo IS NOT NULL;

-- Atualizar a função handle_new_user para incluir os novos campos
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