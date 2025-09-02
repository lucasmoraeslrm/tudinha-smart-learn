-- Fix RLS policies for coordenadores table
-- Remove existing conflicting policies
DROP POLICY IF EXISTS "Global admins can manage all coordinators" ON coordenadores;
DROP POLICY IF EXISTS "School staff can manage coordinators from same school" ON coordenadores;
DROP POLICY IF EXISTS "coordenadores_school_manage" ON coordenadores;
DROP POLICY IF EXISTS "coordenadores_school_read" ON coordenadores;

-- Create clean, working RLS policies for coordenadores
CREATE POLICY "coordenadores_global_admin_all" ON coordenadores
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin' 
    AND p.escola_id IS NULL
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin' 
    AND p.escola_id IS NULL
  )
);

CREATE POLICY "coordenadores_school_staff_manage" ON coordenadores
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE v.escola_id = coordenadores.escola_id
    AND v.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE v.escola_id = coordenadores.escola_id
    AND v.role IN ('school_admin', 'coordinator')
  )
);