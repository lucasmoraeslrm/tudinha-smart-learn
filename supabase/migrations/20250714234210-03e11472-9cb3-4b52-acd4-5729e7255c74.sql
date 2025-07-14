-- Create table for admin chat logs
CREATE TABLE public.admin_chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) NOT NULL,
  admin_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (assuming all authenticated users are admins for now)
CREATE POLICY "Admins can manage chat logs" 
ON public.admin_chat_logs 
FOR ALL 
USING (true);

-- Add index for better performance when querying by student
CREATE INDEX idx_admin_chat_logs_student_id ON public.admin_chat_logs(student_id);
CREATE INDEX idx_admin_chat_logs_created_at ON public.admin_chat_logs(created_at DESC);