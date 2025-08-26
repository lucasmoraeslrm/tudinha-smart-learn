-- Criar tabela de webhooks
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  url_teste TEXT NOT NULL,
  url_producao TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  modo_producao BOOLEAN NOT NULL DEFAULT false,
  escola_id UUID REFERENCES public.escolas(id),
  headers JSONB DEFAULT '{}',
  configuracoes JSONB DEFAULT '{}',
  ultimo_disparo TIMESTAMP WITH TIME ZONE,
  ultimo_status TEXT,
  total_disparos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins podem gerenciar webhooks" 
ON public.webhooks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir tipos padrão de webhooks
INSERT INTO public.webhooks (nome, tipo, url_teste, url_producao, ativo, modo_producao) VALUES
('Chat IA', 'chat_ia', 'https://webhook-test.com/chat-ia', 'https://api.escola.com/webhooks/chat-ia', true, false),
('Criar Tema Redação', 'criar_tema_redacao', 'https://webhook-test.com/criar-tema', 'https://api.escola.com/webhooks/criar-tema', true, false),
('Corrigir Redação Texto', 'corrigir_redacao_texto', 'https://webhook-test.com/corrigir-texto', 'https://api.escola.com/webhooks/corrigir-texto', true, false),
('Corrigir Redação Imagem', 'corrigir_redacao_imagem', 'https://webhook-test.com/corrigir-imagem', 'https://api.escola.com/webhooks/corrigir-imagem', true, false),
('IA Assistente Direção', 'ia_assistente_direcao', 'https://webhook-test.com/assistente-direcao', 'https://api.escola.com/webhooks/assistente-direcao', true, false),
('Jornada do Aluno - Resumo', 'jornada_resumo', 'https://webhook-test.com/jornada-resumo', 'https://api.escola.com/webhooks/jornada-resumo', true, false),
('Jornada do Aluno - Dúvidas', 'jornada_duvidas', 'https://webhook-test.com/jornada-duvidas', 'https://api.escola.com/webhooks/jornada-duvidas', true, false),
('Jornada do Aluno - Criar Exercícios', 'jornada_exercicios', 'https://webhook-test.com/jornada-exercicios', 'https://api.escola.com/webhooks/jornada-exercicios', true, false);