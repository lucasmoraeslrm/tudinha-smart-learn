
-- 1) Adiciona student_id às redações e garante RLS habilitado
ALTER TABLE public.redacoes_usuario
  ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES public.students(id);

ALTER TABLE public.redacoes_usuario ENABLE ROW LEVEL SECURITY;

-- 2) Políticas de acesso
-- 2.1) Admin global (já deve existir, mantemos)
-- Se já existir, esta criação retornará erro; ajuste o nome caso necessário.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'redacoes_usuario'
      AND policyname = 'Redacoes_usuario admin manage'
  ) THEN
    CREATE POLICY "Redacoes_usuario admin manage"
      ON public.redacoes_usuario
      FOR ALL
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
  END IF;
END$$;

-- 2.2) Estudante gerencia suas próprias redações
-- Critério: o usuário logado (auth.uid()) é o mesmo user_id do registro
-- OU seu profile aponta para o mesmo student_id da redação (quando disponível)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'redacoes_usuario'
      AND policyname = 'Students can manage own redacoes'
  ) THEN
    CREATE POLICY "Students can manage own redacoes"
      ON public.redacoes_usuario
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 
          FROM public.profiles p 
          WHERE p.user_id = auth.uid()
            AND (
              redacoes_usuario.user_id = p.user_id
              OR (redacoes_usuario.student_id IS NOT NULL AND p.student_id = redacoes_usuario.student_id)
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 
          FROM public.profiles p 
          WHERE p.user_id = auth.uid()
            AND (
              redacoes_usuario.user_id = p.user_id
              OR (redacoes_usuario.student_id IS NOT NULL AND p.student_id = redacoes_usuario.student_id)
            )
        )
      );
  END IF;
END$$;

-- 2.3) Staff da escola (school_admin/coordinator) pode gerenciar redações da sua escola
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'redacoes_usuario'
      AND policyname = 'School staff can manage school redacoes'
  ) THEN
    CREATE POLICY "School staff can manage school redacoes"
      ON public.redacoes_usuario
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 
          FROM public.profiles p 
          WHERE p.user_id = auth.uid()
            AND p.escola_id = redacoes_usuario.escola_id
            AND p.role IN ('school_admin', 'coordinator')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 
          FROM public.profiles p 
          WHERE p.user_id = auth.uid()
            AND p.escola_id = redacoes_usuario.escola_id
            AND p.role IN ('school_admin', 'coordinator')
        )
      );
  END IF;
END$$;
