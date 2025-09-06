-- Add login_image_url column to escolas table
ALTER TABLE public.escolas
ADD COLUMN IF NOT EXISTS login_image_url text;

-- Drop existing functions to change their return types
DROP FUNCTION IF EXISTS public.get_escola_branding_by_instancia(text);
DROP FUNCTION IF EXISTS public.get_escola_branding_by_domain(text);

-- Recreate the branding functions to include the new field
CREATE OR REPLACE FUNCTION public.get_escola_branding_by_instancia(p_instancia text)
RETURNS TABLE (
  id uuid,
  nome text,
  instancia text,
  codigo text,
  dominio text,
  logo_url text,
  cor_primaria text,
  cor_secundaria text,
  login_image_url text
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
    SELECT 
      e.id, e.nome, e.instancia, e.codigo, e.dominio, e.logo_url, e.cor_primaria, e.cor_secundaria, e.login_image_url
    FROM public.escolas e
    WHERE e.ativa = true
      AND e.instancia IS NOT NULL
      AND lower(e.instancia) = lower(p_instancia)
    LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_escola_branding_by_domain(p_domain text)
RETURNS TABLE (
  id uuid,
  nome text,
  instancia text,
  codigo text,
  dominio text,
  logo_url text,
  cor_primaria text,
  cor_secundaria text,
  login_image_url text
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
      e.id, e.nome, e.instancia, e.codigo, e.dominio, e.logo_url, e.cor_primaria, e.cor_secundaria, e.login_image_url
    FROM public.escolas e
    WHERE e.ativa = true
      AND e.dominio IS NOT NULL
      AND lower(regexp_replace(regexp_replace(e.dominio, '^https?://', ''), '^www\.', '')) = v_clean_input
    LIMIT 1;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_escola_branding_by_instancia(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_escola_branding_by_domain(text) TO anon, authenticated;