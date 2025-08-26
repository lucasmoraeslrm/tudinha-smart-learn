-- Create table for exercise collections (grupos de listas por matéria/série)
CREATE TABLE public.exercise_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materia TEXT NOT NULL,
  serie_escolar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create table for exercise topics (assuntos dentro de uma coleção)
CREATE TABLE public.exercise_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.exercise_collections(id) ON DELETE CASCADE,
  assunto TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for the actual exercises within topics
CREATE TABLE public.topic_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.exercise_topics(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta TEXT NOT NULL,
  explicacao TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for student exercise sessions (when they start a topic)
CREATE TABLE public.student_exercise_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.exercise_topics(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  total_time_seconds INTEGER,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for individual question responses with time tracking
CREATE TABLE public.student_question_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.student_exercise_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.topic_exercises(id),
  student_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_question_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage exercise collections" ON public.exercise_collections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view exercise collections" ON public.exercise_collections FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercise topics" ON public.exercise_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view exercise topics" ON public.exercise_topics FOR SELECT USING (true);

CREATE POLICY "Admins can manage topic exercises" ON public.topic_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Everyone can view topic exercises" ON public.topic_exercises FOR SELECT USING (true);

CREATE POLICY "Students can manage their own sessions" ON public.student_exercise_sessions FOR ALL USING (true);

CREATE POLICY "Students can manage their own responses" ON public.student_question_responses FOR ALL USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_exercise_collections_updated_at
  BEFORE UPDATE ON public.exercise_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_exercise_topics_collection_id ON public.exercise_topics(collection_id);
CREATE INDEX idx_topic_exercises_topic_id ON public.topic_exercises(topic_id);
CREATE INDEX idx_student_sessions_student_topic ON public.student_exercise_sessions(student_id, topic_id);
CREATE INDEX idx_student_responses_session_id ON public.student_question_responses(session_id);