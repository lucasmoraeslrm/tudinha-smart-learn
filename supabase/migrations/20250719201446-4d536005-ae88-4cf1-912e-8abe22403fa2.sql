-- Criar tabelas para máquinas/computadores
CREATE TABLE public.maquinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT,
  ip_address TEXT,
  status TEXT DEFAULT 'disponivel',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de estudantes para incluir código da máquina padrão
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS maquina_padrao TEXT;

-- Criar tabela para logs de login
CREATE TABLE public.login_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  maquina_codigo TEXT,
  ip_address TEXT,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativo'
);

-- Criar tabela para jornadas
CREATE TABLE public.jornadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id),
  aula_titulo TEXT NOT NULL,
  professor_nome TEXT,
  materia TEXT NOT NULL,
  assunto TEXT,
  inicio_previsto TIMESTAMP WITH TIME ZONE,
  fim_previsto TIMESTAMP WITH TIME ZONE,
  inicio_real TIMESTAMP WITH TIME ZONE,
  fim_real TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendente', -- pendente, em_andamento, finalizada, tempo_excedido
  resumo_inicial TEXT,
  tempo_resumo_segundos INTEGER,
  resultado_exercicio JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para professores
CREATE TABLE public.professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  codigo TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  materias TEXT[], -- array de matérias que leciona
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para coordenadores/diretores
CREATE TABLE public.coordenadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  codigo TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  funcao TEXT NOT NULL, -- coordenador, diretor
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para aulas programadas
CREATE TABLE public.aulas_programadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  materia TEXT NOT NULL,
  assunto TEXT,
  professor_id UUID REFERENCES public.professores(id),
  turma TEXT,
  data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER DEFAULT 40,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de exercícios para incluir nível de dificuldade
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS nivel_dificuldade TEXT DEFAULT 'medio'; -- facil, medio, dificil

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_login_logs_student_id ON public.login_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_jornadas_student_id ON public.jornadas(student_id);
CREATE INDEX IF NOT EXISTS idx_jornadas_status ON public.jornadas(status);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON public.aulas_programadas(data_hora_inicio);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.maquinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas_programadas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para máquinas (público para visualização)
CREATE POLICY "Máquinas são visíveis para todos" ON public.maquinas FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar máquinas" ON public.maquinas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para login_logs
CREATE POLICY "Estudantes podem ver seus próprios logs" ON public.login_logs FOR SELECT USING (true);
CREATE POLICY "Sistema pode inserir logs" ON public.login_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Sistema pode atualizar logs" ON public.login_logs FOR UPDATE USING (true);

-- Políticas RLS para jornadas
CREATE POLICY "Jornadas visíveis para todos autenticados" ON public.jornadas FOR SELECT USING (true);
CREATE POLICY "Sistema pode gerenciar jornadas" ON public.jornadas FOR ALL USING (true);

-- Políticas RLS para professores
CREATE POLICY "Professores visíveis para todos autenticados" ON public.professores FOR SELECT USING (true);
CREATE POLICY "Admins podem gerenciar professores" ON public.professores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para coordenadores
CREATE POLICY "Coordenadores visíveis para admins" ON public.coordenadores FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins podem gerenciar coordenadores" ON public.coordenadores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Políticas RLS para aulas programadas
CREATE POLICY "Aulas visíveis para todos autenticados" ON public.aulas_programadas FOR SELECT USING (true);
CREATE POLICY "Admins e professores podem gerenciar aulas" ON public.aulas_programadas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'teacher'))
);

-- Função para verificar senha de professor
CREATE OR REPLACE FUNCTION public.verify_professor_password(input_codigo text, input_password text)
RETURNS TABLE(professor_data json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  professor_record RECORD;
BEGIN
  SELECT * INTO professor_record 
  FROM public.professores 
  WHERE codigo = input_codigo AND ativo = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', professor_record.id,
      'nome', professor_record.nome,
      'codigo', professor_record.codigo,
      'materias', professor_record.materias,
      'password_hash', professor_record.password_hash
    );
  END IF;
END;
$function$;

-- Função para verificar senha de coordenador
CREATE OR REPLACE FUNCTION public.verify_coordenador_password(input_codigo text, input_password text)
RETURNS TABLE(coordenador_data json)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  coord_record RECORD;
BEGIN
  SELECT * INTO coord_record 
  FROM public.coordenadores 
  WHERE codigo = input_codigo AND ativo = true;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', coord_record.id,
      'nome', coord_record.nome,
      'codigo', coord_record.codigo,
      'funcao', coord_record.funcao,
      'password_hash', coord_record.password_hash
    );
  END IF;
END;
$function$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_maquinas_updated_at BEFORE UPDATE ON public.maquinas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jornadas_updated_at BEFORE UPDATE ON public.jornadas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_coordenadores_updated_at BEFORE UPDATE ON public.coordenadores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();