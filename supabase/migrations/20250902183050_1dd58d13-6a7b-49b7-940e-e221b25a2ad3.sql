-- Check and fix RLS policies for coordenadores table
-- First, list all existing policies to understand the current state
DO $$
DECLARE 
  policy_record RECORD;
BEGIN
  -- Remove ALL existing policies for coordenadores table
  FOR policy_record IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'coordenadores' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON coordenadores', policy_record.policyname);
  END LOOP;
END $$;

-- Now create the correct RLS policies for coordenadores
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