-- Phase 1: RLS Hardening - Multi-tenant Security Model
-- Create identity view for simplified RLS
CREATE OR REPLACE VIEW v_current_identity AS
SELECT p.user_id, p.escola_id, p.role, p.student_id
FROM profiles p
WHERE p.user_id = auth.uid();

-- Enable RLS on critical tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE aluno_tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;

-- Students: self + school staff access
DROP POLICY IF EXISTS "Students can view their own data" ON students;
DROP POLICY IF EXISTS "Students can update their own data" ON students;
CREATE POLICY "students_self_or_school_read"
ON students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE v.escola_id = students.escola_id
      AND (v.student_id = students.id OR v.role IN ('admin','school_admin','coordinator'))
  )
);
CREATE POLICY "students_self_update"
ON students FOR UPDATE
USING (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = students.id))
WITH CHECK (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = students.id));

-- Professores: school-scoped access
DROP POLICY IF EXISTS "Professores visíveis para todos autenticados" ON professores;
DROP POLICY IF EXISTS "School admins/coordinators can manage professores for their sch" ON professores;
DROP POLICY IF EXISTS "Launs admins can manage all professores" ON professores;
CREATE POLICY "professores_school_read"
ON professores FOR SELECT
USING (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = professores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
);
CREATE POLICY "professores_school_manage"
ON professores FOR ALL
USING (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = professores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = professores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
);

-- Coordenadores: school-scoped access
DROP POLICY IF EXISTS "Coordenadores visíveis para admins" ON coordenadores;
DROP POLICY IF EXISTS "Admins podem gerenciar coordenadores" ON coordenadores;
DROP POLICY IF EXISTS "School admins/coordinators can view school coordinators" ON coordenadores;
DROP POLICY IF EXISTS "School admins/coordinators can insert school coordinators" ON coordenadores;
DROP POLICY IF EXISTS "School admins/coordinators can update school coordinators" ON coordenadores;
CREATE POLICY "coordenadores_school_read"
ON coordenadores FOR SELECT
USING (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = coordenadores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
);
CREATE POLICY "coordenadores_school_manage"
ON coordenadores FOR ALL
USING (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = coordenadores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = coordenadores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
);

-- Tutores: self + school staff access
DROP POLICY IF EXISTS "Tutores podem ver próprios dados" ON tutores;
DROP POLICY IF EXISTS "Admins podem gerenciar tutores" ON tutores;
CREATE POLICY "tutores_self_or_school"
ON tutores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE v.escola_id = tutores.escola_id
      AND v.role IN ('admin','school_admin','coordinator')
  )
);
CREATE POLICY "tutores_school_manage"
ON tutores FOR ALL
USING (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = tutores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM v_current_identity v
          WHERE v.escola_id = tutores.escola_id
            AND v.role IN ('admin','school_admin','coordinator'))
);

-- Aluno-Tutor relationships: school-scoped
DROP POLICY IF EXISTS "Relacionamento aluno-tutor visível" ON aluno_tutor;
DROP POLICY IF EXISTS "Admins podem gerenciar relacionamento aluno-tutor" ON aluno_tutor;
CREATE POLICY "aluno_tutor_school_read"
ON aluno_tutor FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE EXISTS (
      SELECT 1 FROM tutores t
      WHERE t.id = aluno_tutor.tutor_id
        AND t.escola_id = v.escola_id
    ) AND v.role IN ('admin','school_admin','coordinator')
  )
);
CREATE POLICY "aluno_tutor_school_manage"
ON aluno_tutor FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE EXISTS (
      SELECT 1 FROM tutores t
      WHERE t.id = aluno_tutor.tutor_id
        AND t.escola_id = v.escola_id
    ) AND v.role IN ('admin','school_admin','coordinator')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    WHERE EXISTS (
      SELECT 1 FROM tutores t
      WHERE t.id = aluno_tutor.tutor_id
        AND t.escola_id = v.escola_id
    ) AND v.role IN ('admin','school_admin','coordinator')
  )
);

-- Jornadas: owner + school staff (assuming jornadas has escola_id or via student)
DROP POLICY IF EXISTS "Students can view their own jornadas" ON jornadas;
DROP POLICY IF EXISTS "Professors can view their students' jornadas" ON jornadas;
DROP POLICY IF EXISTS "Professors can manage jornadas for their students" ON jornadas;
CREATE POLICY "jornadas_owner_or_staff_read"
ON jornadas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    JOIN students s ON s.id = jornadas.student_id
    WHERE v.escola_id = s.escola_id
      AND (v.student_id = jornadas.student_id OR v.role IN ('admin','school_admin','coordinator'))
  )
);
CREATE POLICY "jornadas_owner_manage"
ON jornadas FOR ALL
USING (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = jornadas.student_id))
WITH CHECK (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = jornadas.student_id));

-- Student exercise sessions: owner + school staff
DROP POLICY IF EXISTS "Students can manage their own sessions" ON student_exercise_sessions;
DROP POLICY IF EXISTS "Professors can view their students' sessions" ON student_exercise_sessions;
CREATE POLICY "sessions_owner_or_staff_read"
ON student_exercise_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    JOIN students s ON s.id = student_exercise_sessions.student_id
    WHERE v.escola_id = s.escola_id
      AND (v.student_id = student_exercise_sessions.student_id OR v.role IN ('admin','school_admin','coordinator'))
  )
);
CREATE POLICY "sessions_owner_manage"
ON student_exercise_sessions FOR ALL
USING (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = student_exercise_sessions.student_id))
WITH CHECK (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = student_exercise_sessions.student_id));

-- Student question responses: owner only
DROP POLICY IF EXISTS "Students can manage their own responses" ON student_question_responses;
CREATE POLICY "responses_owner_manage"
ON student_question_responses FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM student_exercise_sessions s
    WHERE s.id = student_question_responses.session_id
      AND EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = s.student_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM student_exercise_sessions s
    WHERE s.id = student_question_responses.session_id
      AND EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = s.student_id)
  )
);

-- Student answers: owner + school staff
DROP POLICY IF EXISTS "Students can manage their own answers" ON student_answers;
DROP POLICY IF EXISTS "Professors can view their students' answers" ON student_answers;
CREATE POLICY "answers_owner_or_staff_read"
ON student_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM v_current_identity v
    JOIN students s ON s.id = student_answers.student_id
    WHERE v.escola_id = s.escola_id
      AND (v.student_id = student_answers.student_id OR v.role IN ('admin','school_admin','coordinator'))
  )
);
CREATE POLICY "answers_owner_manage"
ON student_answers FOR ALL
USING (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = student_answers.student_id))
WITH CHECK (EXISTS (SELECT 1 FROM v_current_identity v WHERE v.student_id = student_answers.student_id));