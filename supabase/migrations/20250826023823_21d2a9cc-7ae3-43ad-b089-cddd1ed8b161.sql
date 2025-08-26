-- Adicionar campo ativo na tabela students se não existir
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS ativo boolean NOT NULL DEFAULT true;