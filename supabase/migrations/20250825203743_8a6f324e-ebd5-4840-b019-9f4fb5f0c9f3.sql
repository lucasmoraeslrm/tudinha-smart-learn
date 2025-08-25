-- Criar tabela de matérias
CREATE TABLE public.materias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  escola_id UUID REFERENCES public.escolas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de turmas
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL,
  serie TEXT NOT NULL,
  ano_letivo TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  escola_id UUID REFERENCES public.escolas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(codigo, escola_id)
);

-- Criar tabela de tutores
CREATE TABLE public.tutores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pai', 'mae', 'irmao', 'outro')),
  telefone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  escola_id UUID REFERENCES public.escolas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento aluno-tutor (N:N)
CREATE TABLE public.aluno_tutor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES public.tutores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(aluno_id, tutor_id)
);

-- Criar tabela de relacionamento professor-materia-turma (N:N:N)
CREATE TABLE public.professor_materia_turma (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES public.professores(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professor_id, materia_id, turma_id)
);

-- Atualizar tabela students para ter RA e referências
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS ra TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS turma_id UUID REFERENCES public.turmas(id),
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Atualizar tabela professores removendo materias array e simplificando
ALTER TABLE public.professores 
DROP COLUMN IF EXISTS materias;

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_materia_turma ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para matérias
CREATE POLICY "Materias visíveis para todos autenticados" 
ON public.materias FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar matérias" 
ON public.materias FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Políticas RLS para turmas
CREATE POLICY "Turmas visíveis para todos autenticados" 
ON public.turmas FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar turmas" 
ON public.turmas FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Políticas RLS para tutores
CREATE POLICY "Tutores podem ver próprios dados" 
ON public.tutores FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar tutores" 
ON public.tutores FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Políticas RLS para aluno_tutor
CREATE POLICY "Relacionamento aluno-tutor visível" 
ON public.aluno_tutor FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar relacionamento aluno-tutor" 
ON public.aluno_tutor FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Políticas RLS para professor_materia_turma
CREATE POLICY "Professores podem ver suas atribuições" 
ON public.professor_materia_turma FOR SELECT 
USING (true);

CREATE POLICY "Admins podem gerenciar atribuições professor-materia-turma" 
ON public.professor_materia_turma FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Função para professores verem apenas seus alunos
CREATE OR REPLACE FUNCTION public.get_professor_students(professor_codigo TEXT)
RETURNS TABLE(
  student_id UUID,
  student_name TEXT,
  student_ra TEXT,
  turma_nome TEXT,
  materia_nome TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    s.id as student_id,
    s.name as student_name,
    s.ra as student_ra,
    t.nome as turma_nome,
    m.nome as materia_nome
  FROM public.students s
  JOIN public.turmas t ON s.turma_id = t.id
  JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
  JOIN public.materias m ON pmt.materia_id = m.id
  JOIN public.professores p ON pmt.professor_id = p.id
  WHERE p.codigo = professor_codigo AND pmt.ativo = true;
END;
$$;

-- Função para verificar se professor pode ver aluno
CREATE OR REPLACE FUNCTION public.professor_can_view_student(professor_codigo TEXT, student_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.turmas t ON s.turma_id = t.id
    JOIN public.professor_materia_turma pmt ON pmt.turma_id = t.id
    JOIN public.professores p ON pmt.professor_id = p.id
    WHERE p.codigo = professor_codigo 
    AND s.id = student_id 
    AND pmt.ativo = true
  );
END;
$$;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_materias_updated_at
  BEFORE UPDATE ON public.materias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutores_updated_at
  BEFORE UPDATE ON public.tutores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();