-- Create table for journey-specific exercises
CREATE TABLE public.jornada_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  subject TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  ordem INTEGER NOT NULL DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.jornada_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view jornada exercises" 
ON public.jornada_exercises 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage jornada exercises" 
ON public.jornada_exercises 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Modify jornadas table to work with series instead of individual students
ALTER TABLE public.jornadas 
ADD COLUMN serie_ano_letivo TEXT,
ADD COLUMN serie_turma TEXT,
ADD COLUMN exercise_ids UUID[] DEFAULT '{}';

-- Add trigger for updated_at
CREATE TRIGGER update_jornada_exercises_updated_at
BEFORE UPDATE ON public.jornada_exercises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();