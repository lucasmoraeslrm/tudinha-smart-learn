-- Criar tabela para séries/anos letivos
CREATE TABLE public.series_anos_letivos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID NOT NULL,
  serie TEXT NOT NULL,
  ano_letivo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(escola_id, serie, ano_letivo)
);

-- Adicionar RLS para séries/anos letivos
ALTER TABLE public.series_anos_letivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Escolas podem gerenciar suas séries" 
ON public.series_anos_letivos 
FOR ALL 
USING (true);

-- Adicionar campos de permissões aos coordenadores
ALTER TABLE public.coordenadores 
ADD COLUMN permissoes JSONB DEFAULT '{"financeiro": false, "cadastro_professor": false, "cadastro_aluno": false, "acesso_total": false}'::jsonb;

-- Trigger para atualizar updated_at nas séries
CREATE TRIGGER update_series_anos_letivos_updated_at
BEFORE UPDATE ON public.series_anos_letivos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();