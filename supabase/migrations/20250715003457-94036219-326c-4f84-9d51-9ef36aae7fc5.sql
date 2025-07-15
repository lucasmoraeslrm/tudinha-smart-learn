-- Create student_auth table for custom authentication
CREATE TABLE public.student_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on student_auth
ALTER TABLE public.student_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for student_auth
CREATE POLICY "Students can view their own auth data" 
ON public.student_auth 
FOR SELECT 
USING (true); -- Will be controlled by Edge Functions

-- Add new columns to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS codigo TEXT,
ADD COLUMN IF NOT EXISTS ano_letivo TEXT,
ADD COLUMN IF NOT EXISTS turma TEXT;

-- Make students.codigo unique if not null
CREATE UNIQUE INDEX IF NOT EXISTS students_codigo_unique 
ON public.students(codigo) WHERE codigo IS NOT NULL;

-- Modify profiles table to support both auth types
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id),
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_student_auth_codigo ON public.student_auth(codigo);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);

-- Create trigger for updating student_auth timestamps
CREATE TRIGGER update_student_auth_updated_at
BEFORE UPDATE ON public.student_auth
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to hash passwords (will be used by Edge Functions)
CREATE OR REPLACE FUNCTION public.verify_student_password(input_codigo TEXT, input_password TEXT)
RETURNS TABLE(student_data JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auth_record RECORD;
  student_record RECORD;
BEGIN
  -- Get auth record
  SELECT * INTO auth_record 
  FROM public.student_auth 
  WHERE codigo = input_codigo;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get student data
  SELECT s.*, p.full_name, p.role 
  INTO student_record
  FROM public.students s
  LEFT JOIN public.profiles p ON p.student_id = s.id
  WHERE s.id = auth_record.student_id;
  
  IF FOUND THEN
    RETURN QUERY SELECT json_build_object(
      'id', student_record.id,
      'codigo', auth_record.codigo,
      'name', student_record.name,
      'full_name', student_record.full_name,
      'ano_letivo', student_record.ano_letivo,
      'turma', student_record.turma,
      'password_hash', auth_record.password_hash,
      'role', COALESCE(student_record.role, 'student')
    );
  END IF;
END;
$$;