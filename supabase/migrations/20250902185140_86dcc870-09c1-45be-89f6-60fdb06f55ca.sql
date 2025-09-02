-- Clean up all existing RLS policies and recreate simple admin-only policies

-- Materias - drop all and recreate
DROP POLICY IF EXISTS "Materias visíveis para todos autenticados" ON public.materias;
DROP POLICY IF EXISTS "Admins podem gerenciar materias" ON public.materias;
DROP POLICY IF EXISTS "School admins/coordinators can manage materias for their school" ON public.materias;
DROP POLICY IF EXISTS "Launs admins can manage all materias" ON public.materias;

CREATE POLICY "Materias read all" ON public.materias FOR SELECT USING (true);
CREATE POLICY "Materias admin manage" ON public.materias FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Turmas - drop all and recreate
DROP POLICY IF EXISTS "Turmas visíveis para admins" ON public.turmas;
DROP POLICY IF EXISTS "Admins podem gerenciar turmas" ON public.turmas;
DROP POLICY IF EXISTS "School staff can manage their school turmas" ON public.turmas;
DROP POLICY IF EXISTS "Global admins can manage all turmas" ON public.turmas;

CREATE POLICY "Turmas read admin" ON public.turmas FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Turmas admin manage" ON public.turmas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);

-- Tutores - drop all and recreate
DROP POLICY IF EXISTS "Tutores visíveis para admins" ON public.tutores;
DROP POLICY IF EXISTS "Admins podem gerenciar tutores" ON public.tutores;
DROP POLICY IF EXISTS "tutores_school_manage" ON public.tutores;
DROP POLICY IF EXISTS "tutores_self_or_school" ON public.tutores;
DROP POLICY IF EXISTS "School staff can manage tutors from same school" ON public.tutores;
DROP POLICY IF EXISTS "Global admins can manage all tutors" ON public.tutores;

CREATE POLICY "Tutores read admin" ON public.tutores FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Tutores admin manage" ON public.tutores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin')
);