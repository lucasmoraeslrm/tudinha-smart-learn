-- Criar tabela de escolas
CREATE TABLE public.escolas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  dominio TEXT,
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#3B82F6',
  cor_secundaria TEXT DEFAULT '#1E40AF',
  ativa BOOLEAN NOT NULL DEFAULT true,
  plano TEXT NOT NULL DEFAULT 'basico',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de módulos disponíveis
CREATE TABLE public.modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT,
  icone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de módulos por escola
CREATE TABLE public.escola_modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(escola_id, modulo_id)
);

-- Adicionar escola_id aos usuários existentes
ALTER TABLE public.profiles ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
ALTER TABLE public.students ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
ALTER TABLE public.professores ADD COLUMN escola_id UUID REFERENCES public.escolas(id);
ALTER TABLE public.coordenadores ADD COLUMN escola_id UUID REFERENCES public.escolas(id);

-- Inserir módulos padrão
INSERT INTO public.modulos (nome, codigo, descricao, icone) VALUES
('Chat Tudinha', 'chat', 'Sistema de chat inteligente com IA', 'MessageCircle'),
('Exercícios', 'exercicios', 'Biblioteca de exercícios e avaliações', 'BookOpen'),
('Redação', 'redacao', 'Sistema de correção de redações', 'PenTool'),
('Jornada do Aluno', 'jornada', 'Acompanhamento da evolução do aluno', 'Map');

-- Criar escola padrão para dados existentes
INSERT INTO public.escolas (nome, codigo) VALUES 
('Colégio Almeida Garrett', 'almeida-garrett');

-- Atualizar registros existentes com a escola padrão
UPDATE public.profiles SET escola_id = (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett');
UPDATE public.students SET escola_id = (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett');
UPDATE public.professores SET escola_id = (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett');
UPDATE public.coordenadores SET escola_id = (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett');

-- Habilitar todos os módulos para a escola padrão
INSERT INTO public.escola_modulos (escola_id, modulo_id, ativo)
SELECT 
  (SELECT id FROM public.escolas WHERE codigo = 'almeida-garrett'),
  id,
  true
FROM public.modulos;

-- RLS Policies
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escola_modulos ENABLE ROW LEVEL SECURITY;

-- Apenas admins Launs podem gerenciar escolas
CREATE POLICY "Launs admins can manage schools" ON public.escolas
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Todos podem ver módulos
CREATE POLICY "Everyone can view modules" ON public.modulos
FOR SELECT USING (true);

-- Apenas admins Launs podem gerenciar módulos
CREATE POLICY "Launs admins can manage modules" ON public.modulos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins Launs podem gerenciar escola_modulos
CREATE POLICY "Launs admins can manage school modules" ON public.escola_modulos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Escolas podem ver seus próprios módulos
CREATE POLICY "Schools can view their modules" ON public.escola_modulos
FOR SELECT USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_escolas_updated_at
  BEFORE UPDATE ON public.escolas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();