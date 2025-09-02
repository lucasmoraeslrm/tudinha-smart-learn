-- Phase 2: Foreign Keys, Uniqueness, and Indexes (Zero Downtime) - Fixed

-- Add escola_id to jornadas table if it doesn't exist
ALTER TABLE jornadas ADD COLUMN IF NOT EXISTS escola_id uuid;

-- Backfill escola_id for jornadas based on student's escola_id
UPDATE jornadas 
SET escola_id = s.escola_id
FROM students s 
WHERE jornadas.student_id = s.id 
  AND jornadas.escola_id IS NULL;

-- Foreign Key Constraints (using DO blocks for conditional creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'professores_escola_fk') THEN
        ALTER TABLE professores ADD CONSTRAINT professores_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE professores VALIDATE CONSTRAINT professores_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'coordenadores_escola_fk') THEN
        ALTER TABLE coordenadores ADD CONSTRAINT coordenadores_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE coordenadores VALIDATE CONSTRAINT coordenadores_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'students_escola_fk') THEN
        ALTER TABLE students ADD CONSTRAINT students_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE students VALIDATE CONSTRAINT students_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'students_turma_fk') THEN
        ALTER TABLE students ADD CONSTRAINT students_turma_fk FOREIGN KEY (turma_id) REFERENCES turmas(id) NOT VALID;
    END IF;
    ALTER TABLE students VALIDATE CONSTRAINT students_turma_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tutores_escola_fk') THEN
        ALTER TABLE tutores ADD CONSTRAINT tutores_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE tutores VALIDATE CONSTRAINT tutores_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'materias_escola_fk') THEN
        ALTER TABLE materias ADD CONSTRAINT materias_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE materias VALIDATE CONSTRAINT materias_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'turmas_escola_fk') THEN
        ALTER TABLE turmas ADD CONSTRAINT turmas_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE turmas VALIDATE CONSTRAINT turmas_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jornadas_student_fk') THEN
        ALTER TABLE jornadas ADD CONSTRAINT jornadas_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE jornadas VALIDATE CONSTRAINT jornadas_student_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'jornadas_escola_fk') THEN
        ALTER TABLE jornadas ADD CONSTRAINT jornadas_escola_fk FOREIGN KEY (escola_id) REFERENCES escolas(id) NOT VALID;
    END IF;
    ALTER TABLE jornadas VALIDATE CONSTRAINT jornadas_escola_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ses_student_fk') THEN
        ALTER TABLE student_exercise_sessions ADD CONSTRAINT ses_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE student_exercise_sessions VALIDATE CONSTRAINT ses_student_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'resp_session_fk') THEN
        ALTER TABLE student_question_responses ADD CONSTRAINT resp_session_fk FOREIGN KEY (session_id) REFERENCES student_exercise_sessions(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE student_question_responses VALIDATE CONSTRAINT resp_session_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'answers_student_fk') THEN
        ALTER TABLE student_answers ADD CONSTRAINT answers_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE student_answers VALIDATE CONSTRAINT answers_student_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'answers_exercise_fk') THEN
        ALTER TABLE student_answers ADD CONSTRAINT answers_exercise_fk FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE student_answers VALIDATE CONSTRAINT answers_exercise_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'messages_chat_fk') THEN
        ALTER TABLE messages ADD CONSTRAINT messages_chat_fk FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE messages VALIDATE CONSTRAINT messages_chat_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pmt_professor_fk') THEN
        ALTER TABLE professor_materia_turma ADD CONSTRAINT pmt_professor_fk FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE professor_materia_turma VALIDATE CONSTRAINT pmt_professor_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pmt_materia_fk') THEN
        ALTER TABLE professor_materia_turma ADD CONSTRAINT pmt_materia_fk FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE professor_materia_turma VALIDATE CONSTRAINT pmt_materia_fk;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'pmt_turma_fk') THEN
        ALTER TABLE professor_materia_turma ADD CONSTRAINT pmt_turma_fk FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE NOT VALID;
    END IF;
    ALTER TABLE professor_materia_turma VALIDATE CONSTRAINT pmt_turma_fk;
END $$;

-- Uniqueness constraints (using DO blocks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'students_codigo_escola_uniq') THEN
        ALTER TABLE students ADD CONSTRAINT students_codigo_escola_uniq UNIQUE (escola_id, codigo);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'professores_codigo_escola_uniq') THEN
        ALTER TABLE professores ADD CONSTRAINT professores_codigo_escola_uniq UNIQUE (escola_id, codigo);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'coordenadores_codigo_escola_uniq') THEN
        ALTER TABLE coordenadores ADD CONSTRAINT coordenadores_codigo_escola_uniq UNIQUE (escola_id, codigo);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'turmas_codigo_escola_uniq') THEN
        ALTER TABLE turmas ADD CONSTRAINT turmas_codigo_escola_uniq UNIQUE (escola_id, codigo);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'materias_codigo_escola_uniq') THEN
        ALTER TABLE materias ADD CONSTRAINT materias_codigo_escola_uniq UNIQUE (escola_id, codigo);
    END IF;
END $$;

-- Performance indexes (these support IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS students_escola_idx ON students(escola_id);
CREATE INDEX IF NOT EXISTS students_turma_idx ON students(turma_id);
CREATE INDEX IF NOT EXISTS students_codigo_idx ON students(codigo);

CREATE INDEX IF NOT EXISTS professores_escola_idx ON professores(escola_id);
CREATE INDEX IF NOT EXISTS professores_codigo_idx ON professores(codigo);

CREATE INDEX IF NOT EXISTS coordenadores_escola_idx ON coordenadores(escola_id);
CREATE INDEX IF NOT EXISTS coordenadores_codigo_idx ON coordenadores(codigo);

CREATE INDEX IF NOT EXISTS jornadas_student_idx ON jornadas(student_id);
CREATE INDEX IF NOT EXISTS jornadas_escola_idx ON jornadas(escola_id);
CREATE INDEX IF NOT EXISTS jornadas_status_idx ON jornadas(status);
CREATE INDEX IF NOT EXISTS jornadas_created_idx ON jornadas(created_at DESC);

CREATE INDEX IF NOT EXISTS ses_student_created_idx ON student_exercise_sessions(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS resp_session_idx ON student_question_responses(session_id);

CREATE INDEX IF NOT EXISTS answers_student_idx ON student_answers(student_id);
CREATE INDEX IF NOT EXISTS answers_exercise_idx ON student_answers(exercise_id);

CREATE INDEX IF NOT EXISTS msg_chat_created_idx ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chats_user_updated_idx ON chats(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS pmt_professor_idx ON professor_materia_turma(professor_id);
CREATE INDEX IF NOT EXISTS pmt_materia_idx ON professor_materia_turma(materia_id);
CREATE INDEX IF NOT EXISTS pmt_turma_idx ON professor_materia_turma(turma_id);
CREATE INDEX IF NOT EXISTS pmt_ativo_idx ON professor_materia_turma(ativo);