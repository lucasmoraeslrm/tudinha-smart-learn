-- Update RLS policies for professores table to allow school admins and coordinators to manage professores for their school

-- Drop existing restrictive policy if exists
DROP POLICY IF EXISTS "Admins podem gerenciar professores" ON public.professores;

-- Create new policies that allow school admins and coordinators to manage professores for their school
CREATE POLICY "School admins/coordinators can manage professores for their school"
ON public.professores
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = professores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = professores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
);

-- Keep existing policy for Launs admins (global admins)
CREATE POLICY "Launs admins can manage all professores"
ON public.professores
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