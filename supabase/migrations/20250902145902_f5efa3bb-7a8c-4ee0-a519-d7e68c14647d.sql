-- Update RLS policies for escolas table to allow system-wide access for now
-- This will allow professors to view school data
DROP POLICY IF EXISTS "Professors can view their school data" ON public.escolas;

CREATE POLICY "System can view school data" 
ON public.escolas 
FOR SELECT 
USING (true);