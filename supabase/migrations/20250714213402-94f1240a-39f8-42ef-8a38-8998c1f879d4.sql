-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB, -- For multiple choice questions
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_answers table
CREATE TABLE public.student_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view and manage their own data" 
ON public.students FOR ALL USING (true); -- Open for now

CREATE POLICY "Everyone can view exercises" 
ON public.exercises FOR SELECT USING (true);

CREATE POLICY "Students can view their own answers" 
ON public.student_answers FOR ALL USING (true); -- Open for now

-- Create indexes
CREATE INDEX idx_student_answers_student ON public.student_answers(student_id);
CREATE INDEX idx_student_answers_exercise ON public.student_answers(exercise_id);
CREATE INDEX idx_exercises_subject ON public.exercises(subject);

-- Insert sample exercises
INSERT INTO public.exercises (title, subject, question, options, correct_answer, explanation, difficulty) VALUES
('Equação do 2º Grau', 'Matemática', 'Qual é a solução da equação x² - 5x + 6 = 0?', 
 '["x = 2 e x = 3", "x = 1 e x = 6", "x = -2 e x = -3", "x = 0 e x = 5"]', 
 'x = 2 e x = 3', 
 'Usando a fórmula de Bhaskara: x = (5 ± √(25-24))/2 = (5 ± 1)/2, temos x = 2 ou x = 3', 
 'medium'),

('Sistema Solar', 'Física', 'Qual planeta está mais próximo do Sol?', 
 '["Vênus", "Terra", "Mercúrio", "Marte"]', 
 'Mercúrio', 
 'Mercúrio é o planeta mais próximo do Sol, com distância média de 58 milhões de km', 
 'easy'),

('Função Quadrática', 'Matemática', 'O vértice da parábola y = x² - 4x + 3 tem coordenadas:', 
 '["(2, -1)", "(2, 1)", "(-2, -1)", "(-2, 1)"]', 
 '(2, -1)', 
 'O vértice está em x = -b/2a = 4/2 = 2, e y = 4 - 8 + 3 = -1', 
 'medium'),

('Cinemática', 'Física', 'Um carro acelera de 0 a 60 km/h em 10 segundos. Qual sua aceleração média?', 
 '["1,67 m/s²", "6 m/s²", "16,7 m/s²", "60 m/s²"]', 
 '1,67 m/s²', 
 '60 km/h = 16,67 m/s. Aceleração = Δv/Δt = 16,67/10 = 1,67 m/s²', 
 'hard');