
-- Add missing columns expected by salvar-correcao
ALTER TABLE public.redacoes_usuario
  ADD COLUMN IF NOT EXISTS correcao_ia jsonb,
  ADD COLUMN IF NOT EXISTS data_correcao timestamptz;

-- Optional: small docs to future-proof
COMMENT ON COLUMN public.redacoes_usuario.correcao_ia IS 'Resultado estruturado da correção (JSON da IA/N8N).';
COMMENT ON COLUMN public.redacoes_usuario.data_correcao IS 'Timestamp UTC do momento em que a correção foi salva.';

-- Ensure PostgREST schema cache is refreshed immediately
NOTIFY pgrst, 'reload schema';
