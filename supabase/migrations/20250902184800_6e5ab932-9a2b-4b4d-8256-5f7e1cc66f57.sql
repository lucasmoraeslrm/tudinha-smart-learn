-- Revert professores and students RLS policies to original version

-- Drop current professores policies
DROP POLICY IF EXISTS "professores_school_manage" ON public.professores;
DROP POLICY IF EXISTS "professores_school_read" ON public.professores;
DROP POLICY IF EXISTS "Global admins can manage all professors" ON public.professores;

-- Recreate original professores policies
CREATE POLICY "Professores visíveis para admins" 
ON public.professores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar professores" 
ON public.professores 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Drop current students policies
DROP POLICY IF EXISTS "students_self_or_school_read" ON public.students;
DROP POLICY IF EXISTS "students_self_update" ON public.students;
DROP POLICY IF EXISTS "School staff can manage their school students" ON public.students;
DROP POLICY IF EXISTS "Global admins can manage all students" ON public.students;

-- Recreate original students policies
CREATE POLICY "Students visíveis para admins" 
ON public.students 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar students" 
ON public.students 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));