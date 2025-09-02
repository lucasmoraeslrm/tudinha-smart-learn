-- Create composition themes and user compositions tables with RLS

-- Create temas_redacao table if not exists
CREATE TABLE IF NOT EXISTS temas_redacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  texto_motivador text,
  competencias jsonb DEFAULT '[]'::jsonb,
  ativo boolean DEFAULT true,
  publica boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create redacoes_usuario table if not exists
CREATE TABLE IF NOT EXISTS redacoes_usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  escola_id uuid REFERENCES escolas(id),
  tema_id uuid REFERENCES temas_redacao(id),
  titulo text,
  conteudo text NOT NULL,
  palavras integer,
  tempo_ms integer,
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviada', 'avaliada')),
  notas jsonb DEFAULT '{}'::jsonb,
  feedback jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE temas_redacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE redacoes_usuario ENABLE ROW LEVEL SECURITY;

-- RLS Policies for temas_redacao
DROP POLICY IF EXISTS "temas_public_read" ON temas_redacao;
CREATE POLICY "temas_public_read" ON temas_redacao 
FOR SELECT USING (publica = true AND ativo = true);

DROP POLICY IF EXISTS "temas_admin_manage" ON temas_redacao;
CREATE POLICY "temas_admin_manage" ON temas_redacao 
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for redacoes_usuario
DROP POLICY IF EXISTS "redacoes_owner_manage" ON redacoes_usuario;
CREATE POLICY "redacoes_owner_manage" ON redacoes_usuario 
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "redacoes_staff_read" ON redacoes_usuario;
CREATE POLICY "redacoes_staff_read" ON redacoes_usuario 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v 
    WHERE v.escola_id = redacoes_usuario.escola_id 
    AND v.role IN ('admin', 'school_admin', 'coordinator')
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_temas_redacao_updated_at
  BEFORE UPDATE ON temas_redacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redacoes_usuario_updated_at
  BEFORE UPDATE ON redacoes_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_temas_redacao_publica_ativo ON temas_redacao(publica, ativo);
CREATE INDEX IF NOT EXISTS idx_redacoes_usuario_user_id ON redacoes_usuario(user_id);
CREATE INDEX IF NOT EXISTS idx_redacoes_usuario_tema_id ON redacoes_usuario(tema_id);
CREATE INDEX IF NOT EXISTS idx_redacoes_usuario_status ON redacoes_usuario(status);
CREATE INDEX IF NOT EXISTS idx_redacoes_usuario_escola_id ON redacoes_usuario(escola_id);