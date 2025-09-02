-- Update RLS policies to allow school coordinators to view data from their own school

-- Fix students table policies
DROP POLICY IF EXISTS "Students visíveis para admins" ON students;
DROP POLICY IF EXISTS "Admins podem gerenciar students" ON students;

CREATE POLICY "School staff can view students from their school" ON students
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = students.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

CREATE POLICY "School staff can manage students from their school" ON students
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = students.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = students.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

-- Fix professores table policies  
DROP POLICY IF EXISTS "Professores visíveis para admins" ON professores;
DROP POLICY IF EXISTS "Admins podem gerenciar professores" ON professores;

CREATE POLICY "School staff can view professors from their school" ON professores
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = professores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

CREATE POLICY "School staff can manage professors from their school" ON professores
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = professores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = professores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

-- Fix coordenadores table policies
DROP POLICY IF EXISTS "Coordenadores visíveis para admins" ON coordenadores;
DROP POLICY IF EXISTS "Admins podem gerenciar coordenadores" ON coordenadores;

CREATE POLICY "School staff can view coordinators from their school" ON coordenadores
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = coordenadores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

CREATE POLICY "School staff can manage coordinators from their school" ON coordenadores
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = coordenadores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = coordenadores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

-- Fix tutores table policies
DROP POLICY IF EXISTS "Tutores read admin" ON tutores;
DROP POLICY IF EXISTS "Tutores admin manage" ON tutores;

CREATE POLICY "School staff can view tutors from their school" ON tutores
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = tutores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

CREATE POLICY "School staff can manage tutors from their school" ON tutores
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = tutores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = tutores.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

-- Fix turmas table policies
DROP POLICY IF EXISTS "Turmas read admin" ON turmas;
DROP POLICY IF EXISTS "Turmas admin manage" ON turmas;

CREATE POLICY "School staff can view turmas from their school" ON turmas
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = turmas.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

CREATE POLICY "School staff can manage turmas from their school" ON turmas
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = turmas.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = turmas.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);

-- Fix materias table policies
DROP POLICY IF EXISTS "Materias admin manage" ON materias;

CREATE POLICY "School staff can manage materias from their school" ON materias
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = materias.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.escola_id = materias.escola_id 
    AND p.role IN ('admin', 'coordinator', 'school_admin')
  )
);