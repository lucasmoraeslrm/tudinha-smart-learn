-- Policies to allow school admins and coordinators to manage/access coordinators of their own school
-- Ensure RLS is enabled
ALTER TABLE public.coordenadores ENABLE ROW LEVEL SECURITY;

-- Allow SELECT for school_admin and coordinator of the same school
CREATE POLICY "School admins/coordinators can view school coordinators"
ON public.coordenadores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = coordenadores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
);

-- Allow INSERT for school_admin and coordinator for their school
CREATE POLICY "School admins/coordinators can insert school coordinators"
ON public.coordenadores
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = coordenadores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
);

-- Allow UPDATE for school_admin and coordinator for their school
CREATE POLICY "School admins/coordinators can update school coordinators"
ON public.coordenadores
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = coordenadores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.escola_id = coordenadores.escola_id
      AND p.role IN ('school_admin','coordinator')
  )
);