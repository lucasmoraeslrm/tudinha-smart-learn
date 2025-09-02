-- Update RLS policies for materias table to allow school admins and coordinators to manage materias for their school

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins podem gerenciar matérias" ON public.materias;

-- Create new policies that allow school admins and coordinators to manage materias for their school
CREATE POLICY "School admins/coordinators can manage materias for their school"
ON public.materias
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = materias.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = materias.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
);

-- Keep existing policy for Launs admins (global admins)
CREATE POLICY "Launs admins can manage all materias"
ON public.materias
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
      AND p.escola_id IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'admin'
      AND p.escola_id IS NULL
  )
);