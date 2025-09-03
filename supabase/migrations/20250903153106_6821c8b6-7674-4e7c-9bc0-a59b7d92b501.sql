-- Create AI ENEM configuration table
CREATE TABLE public.ai_enem_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES public.escolas(id),
  prompt_correcao TEXT NOT NULL DEFAULT 'Analise esta redação seguindo os critérios do ENEM: Competência I (norma culta), Competência II (tema), Competência III (argumentação), Competência IV (coesão), Competência V (proposta de intervenção). Dê uma nota de 0 a 200 para cada competência e justifique.',
  modelo_openai TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_enem_config ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage AI ENEM config" 
ON public.ai_enem_config 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "School staff can view their AI config" 
ON public.ai_enem_config 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() 
  AND p.escola_id = ai_enem_config.escola_id 
  AND p.role IN ('school_admin', 'coordinator')
));

-- Add updated_at trigger
CREATE TRIGGER update_ai_enem_config_updated_at
BEFORE UPDATE ON public.ai_enem_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration for existing schools
INSERT INTO public.ai_enem_config (escola_id)
SELECT id FROM public.escolas WHERE ativa = true;