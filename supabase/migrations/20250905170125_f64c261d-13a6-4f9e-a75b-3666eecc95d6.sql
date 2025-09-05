-- Make user_id nullable in redacoes_usuario table since students don't have auth.users records
ALTER TABLE public.redacoes_usuario 
ALTER COLUMN user_id DROP NOT NULL;