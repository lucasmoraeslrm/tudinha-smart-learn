-- =============================================================================
-- PHASE 2 CONTINUED: DATA INTEGRITY - UNIQUE CONSTRAINTS
-- =============================================================================

-- Add unique constraints where needed (checking if they don't exist first)

-- School codes should be unique
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_escolas_codigo') THEN
    ALTER TABLE public.escolas ADD CONSTRAINT uk_escolas_codigo UNIQUE (codigo);
  END IF;
END
$$;

-- Professor codes should be unique per school
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_professores_codigo_escola') THEN
    ALTER TABLE public.professores ADD CONSTRAINT uk_professores_codigo_escola UNIQUE (codigo, escola_id);
  END IF;
END
$$;

-- Coordinator codes should be unique per school
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_coordenadores_codigo_escola') THEN
    ALTER TABLE public.coordenadores ADD CONSTRAINT uk_coordenadores_codigo_escola UNIQUE (codigo, escola_id);
  END IF;
END
$$;

-- Student RA should be unique per school
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_students_ra_escola') THEN
    ALTER TABLE public.students ADD CONSTRAINT uk_students_ra_escola UNIQUE (ra, escola_id);
  END IF;
END
$$;

-- Student codes should be unique
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_students_codigo') THEN
    ALTER TABLE public.students ADD CONSTRAINT uk_students_codigo UNIQUE (codigo);
  END IF;
END
$$;

-- Materia codes should be unique per school
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_materias_codigo_escola') THEN
    ALTER TABLE public.materias ADD CONSTRAINT uk_materias_codigo_escola UNIQUE (codigo, escola_id);
  END IF;
END
$$;

-- Turma codes should be unique per school
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_turmas_codigo_escola') THEN
    ALTER TABLE public.turmas ADD CONSTRAINT uk_turmas_codigo_escola UNIQUE (codigo, escola_id);
  END IF;
END
$$;

-- Machine codes should be unique
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_maquinas_codigo') THEN
    ALTER TABLE public.maquinas ADD CONSTRAINT uk_maquinas_codigo UNIQUE (codigo);
  END IF;
END
$$;

-- Module codes should be unique
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_modulos_codigo') THEN
    ALTER TABLE public.modulos ADD CONSTRAINT uk_modulos_codigo UNIQUE (codigo);
  END IF;
END
$$;

-- Prevent duplicate professor-materia-turma assignments
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_pmt_professor_materia_turma') THEN
    ALTER TABLE public.professor_materia_turma 
    ADD CONSTRAINT uk_pmt_professor_materia_turma 
    UNIQUE (professor_id, materia_id, turma_id);
  END IF;
END
$$;

-- User profile should be unique per user
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk_profiles_user_id') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT uk_profiles_user_id UNIQUE (user_id);
  END IF;
END
$$;