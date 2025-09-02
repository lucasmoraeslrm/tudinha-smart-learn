-- Revert coordenadores RLS policies to original version

-- Drop current policies
DROP POLICY IF EXISTS "coordenadores_global_admin_all" ON public.coordenadores;
DROP POLICY IF EXISTS "coordenadores_school_staff_manage" ON public.coordenadores;

-- Recreate original policies
CREATE POLICY "Coordenadores visíveis para admins" 
ON public.coordenadores 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

CREATE POLICY "Admins podem gerenciar coordenadores" 
ON public.coordenadores 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));