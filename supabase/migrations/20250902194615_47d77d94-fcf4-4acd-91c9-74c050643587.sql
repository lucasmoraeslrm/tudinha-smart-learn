-- Update RLS policies to allow global admin access

-- Students table policies
DROP POLICY IF EXISTS "School staff can manage students from their school" ON students;
DROP POLICY IF EXISTS "School staff can view students from their school" ON students;

CREATE POLICY "Global admins can manage all students" ON students
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage students from their school" ON students
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = students.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = students.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);

-- Turmas table policies
DROP POLICY IF EXISTS "School staff can manage turmas from their school" ON turmas;
DROP POLICY IF EXISTS "School staff can view turmas from their school" ON turmas;

CREATE POLICY "Global admins can manage all turmas" ON turmas
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage turmas from their school" ON turmas
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = turmas.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = turmas.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);

-- Professores table policies
DROP POLICY IF EXISTS "School staff can manage professors from their school" ON professores;
DROP POLICY IF EXISTS "School staff can view professors from their school" ON professores;

CREATE POLICY "Global admins can manage all professors" ON professores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage professors from their school" ON professores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = professores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = professores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);

-- Coordenadores table policies
DROP POLICY IF EXISTS "School staff can manage coordinators from their school" ON coordenadores;
DROP POLICY IF EXISTS "School staff can view coordinators from their school" ON coordenadores;

CREATE POLICY "Global admins can manage all coordinators" ON coordenadores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage coordinators from their school" ON coordenadores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = coordenadores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = coordenadores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);

-- Tutores table policies
DROP POLICY IF EXISTS "School staff can manage tutors from their school" ON tutores;
DROP POLICY IF EXISTS "School staff can view tutors from their school" ON tutores;

CREATE POLICY "Global admins can manage all tutors" ON tutores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage tutors from their school" ON tutores
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = tutores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = tutores.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);

-- Materias table policies
DROP POLICY IF EXISTS "School staff can manage materias from their school" ON materias;

CREATE POLICY "Global admins can manage all materias" ON materias
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

CREATE POLICY "School staff can manage materias from their school" ON materias
FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = materias.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = materias.escola_id 
    AND p.role IN ('school_admin', 'coordinator')
  )
);