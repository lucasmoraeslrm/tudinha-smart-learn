-- Allow school_admin and coordinator to SELECT their own school row
-- This enables SAAS per-tenant visibility for school data in the UI

-- Create SELECT policy for non-admin school users to see their own school
CREATE POLICY "School users can view their own school"
ON public.escolas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = escolas.id
      AND p.role IN ('school_admin', 'coordinator')
  )
);