-- 1) Adiciona coluna 'instancia' (slug) em escolas
ALTER TABLE public.escolas
ADD COLUMN IF NOT EXISTS instancia text;

-- Índice único case-insensitive (permite NULL) para evitar colisão de instâncias
CREATE UNIQUE INDEX IF NOT EXISTS escolas_instancia_unique_ci
ON public.escolas (lower(instancia))
WHERE instancia IS NOT NULL;

-- Índice para buscas por domínio (case-insensitive). Não forço unicidade agora para não colidir com dados existentes.
CREATE INDEX IF NOT EXISTS escolas_dominio_ci_idx
ON public.escolas (lower(dominio))
WHERE dominio IS NOT NULL;

-- 2) Função pública segura para buscar branding por instância (slug)
CREATE OR REPLACE FUNCTION public.get_escola_branding_by_instancia(p_instancia text)
RETURNS TABLE (
  id uuid,
  nome text,
  instancia text,
  codigo text,
  dominio text,
  logo_url text,
  cor_primaria text,
  cor_secundaria text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
    SELECT 
      e.id, e.nome, e.instancia, e.codigo, e.dominio, e.logo_url, e.cor_primaria, e.cor_secundaria
    FROM public.escolas e
    WHERE e.ativa = true
      AND e.instancia IS NOT NULL
      AND lower(e.instancia) = lower(p_instancia)
    LIMIT 1;
END;
$$;

-- 3) Função pública segura para buscar branding por domínio
-- Normaliza ambos (input e armazenado) removendo http(s):// e prefixo www.
CREATE OR REPLACE FUNCTION public.get_escola_branding_by_domain(p_domain text)
RETURNS TABLE (
  id uuid,
  nome text,
  instancia text,
  codigo text,
  dominio text,
  logo_url text,
  cor_primaria text,
  cor_secundaria text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_clean_input text;
BEGIN
  -- remove protocolo e 'www.' do input
  v_clean_input := lower(regexp_replace(regexp_replace(p_domain, '^https?://', ''), '^www\.', ''));

  RETURN QUERY
    SELECT 
      e.id, e.nome, e.instancia, e.codigo, e.dominio, e.logo_url, e.cor_primaria, e.cor_secundaria
    FROM public.escolas e
    WHERE e.ativa = true
      AND e.dominio IS NOT NULL
      AND lower(regexp_replace(regexp_replace(e.dominio, '^https?://', ''), '^www\.', '')) = v_clean_input
    LIMIT 1;
END;
$$;

-- 4) Permissões: permitir acesso público (pré-login) somente à execução das funções
GRANT EXECUTE ON FUNCTION public.get_escola_branding_by_instancia(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_escola_branding_by_domain(text) TO anon, authenticated;