-- =============================================================================
-- PHASE 2: DATA INTEGRITY - FOREIGN KEYS AND INDEXES
-- =============================================================================

-- 1. Add Foreign Key constraints with indexes for performance

-- School relationships
ALTER TABLE public.professores 
ADD CONSTRAINT fk_professores_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_professores_escola_id ON public.professores(escola_id);

ALTER TABLE public.coordenadores 
ADD CONSTRAINT fk_coordenadores_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_coordenadores_escola_id ON public.coordenadores(escola_id);

ALTER TABLE public.tutores 
ADD CONSTRAINT fk_tutores_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_tutores_escola_id ON public.tutores(escola_id);

ALTER TABLE public.materias 
ADD CONSTRAINT fk_materias_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_materias_escola_id ON public.materias(escola_id);

ALTER TABLE public.turmas 
ADD CONSTRAINT fk_turmas_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_turmas_escola_id ON public.turmas(escola_id);

-- Student relationships
ALTER TABLE public.students 
ADD CONSTRAINT fk_students_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

ALTER TABLE public.students 
ADD CONSTRAINT fk_students_turma 
FOREIGN KEY (turma_id) REFERENCES public.turmas(id);

CREATE INDEX idx_students_escola_id ON public.students(escola_id);
CREATE INDEX idx_students_turma_id ON public.students(turma_id);
CREATE INDEX idx_students_codigo ON public.students(codigo);

-- Student auth relationship
ALTER TABLE public.student_auth 
ADD CONSTRAINT fk_student_auth_student 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

CREATE INDEX idx_student_auth_student_id ON public.student_auth(student_id);
CREATE UNIQUE INDEX idx_student_auth_codigo ON public.student_auth(codigo);

-- Professor-Materia-Turma relationships
ALTER TABLE public.professor_materia_turma 
ADD CONSTRAINT fk_pmt_professor 
FOREIGN KEY (professor_id) REFERENCES public.professores(id);

ALTER TABLE public.professor_materia_turma 
ADD CONSTRAINT fk_pmt_materia 
FOREIGN KEY (materia_id) REFERENCES public.materias(id);

ALTER TABLE public.professor_materia_turma 
ADD CONSTRAINT fk_pmt_turma 
FOREIGN KEY (turma_id) REFERENCES public.turmas(id);

CREATE INDEX idx_pmt_professor_id ON public.professor_materia_turma(professor_id);
CREATE INDEX idx_pmt_materia_id ON public.professor_materia_turma(materia_id);
CREATE INDEX idx_pmt_turma_id ON public.professor_materia_turma(turma_id);
CREATE INDEX idx_pmt_professor_turma ON public.professor_materia_turma(professor_id, turma_id);
CREATE INDEX idx_pmt_turma_materia ON public.professor_materia_turma(turma_id, materia_id);

-- Journey relationships
ALTER TABLE public.jornadas 
ADD CONSTRAINT fk_jornadas_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

CREATE INDEX idx_jornadas_student_id ON public.jornadas(student_id);
CREATE INDEX idx_jornadas_status ON public.jornadas(status);
CREATE INDEX idx_jornadas_exercise_ids ON public.jornadas USING GIN(exercise_ids);

-- Student answers relationships
ALTER TABLE public.student_answers 
ADD CONSTRAINT fk_student_answers_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

ALTER TABLE public.student_answers 
ADD CONSTRAINT fk_student_answers_exercise 
FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);

CREATE INDEX idx_student_answers_student_id ON public.student_answers(student_id);
CREATE INDEX idx_student_answers_exercise_id ON public.student_answers(exercise_id);

-- Student exercise sessions relationships
ALTER TABLE public.student_exercise_sessions 
ADD CONSTRAINT fk_sessions_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

ALTER TABLE public.student_exercise_sessions 
ADD CONSTRAINT fk_sessions_topic 
FOREIGN KEY (topic_id) REFERENCES public.exercise_topics(id);

CREATE INDEX idx_sessions_student_id ON public.student_exercise_sessions(student_id);
CREATE INDEX idx_sessions_topic_id ON public.student_exercise_sessions(topic_id);

-- Student question responses relationships
ALTER TABLE public.student_question_responses 
ADD CONSTRAINT fk_responses_session 
FOREIGN KEY (session_id) REFERENCES public.student_exercise_sessions(id);

ALTER TABLE public.student_question_responses 
ADD CONSTRAINT fk_responses_exercise 
FOREIGN KEY (exercise_id) REFERENCES public.exercises(id);

CREATE INDEX idx_responses_session_id ON public.student_question_responses(session_id);
CREATE INDEX idx_responses_exercise_id ON public.student_question_responses(exercise_id);

-- Login logs relationships
ALTER TABLE public.login_logs 
ADD CONSTRAINT fk_login_logs_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

CREATE INDEX idx_login_logs_student_id ON public.login_logs(student_id);
CREATE INDEX idx_login_logs_login_time ON public.login_logs(login_time);

-- Exercise collections relationships
ALTER TABLE public.exercise_topics 
ADD CONSTRAINT fk_topics_collection 
FOREIGN KEY (collection_id) REFERENCES public.exercise_collections(id);

ALTER TABLE public.topic_exercises 
ADD CONSTRAINT fk_topic_exercises_topic 
FOREIGN KEY (topic_id) REFERENCES public.exercise_topics(id);

CREATE INDEX idx_topics_collection_id ON public.exercise_topics(collection_id);
CREATE INDEX idx_topic_exercises_topic_id ON public.topic_exercises(topic_id);

-- Aluno-Tutor relationships
ALTER TABLE public.aluno_tutor 
ADD CONSTRAINT fk_aluno_tutor_aluno 
FOREIGN KEY (aluno_id) REFERENCES public.students(id);

ALTER TABLE public.aluno_tutor 
ADD CONSTRAINT fk_aluno_tutor_tutor 
FOREIGN KEY (tutor_id) REFERENCES public.tutores(id);

CREATE INDEX idx_aluno_tutor_aluno_id ON public.aluno_tutor(aluno_id);
CREATE INDEX idx_aluno_tutor_tutor_id ON public.aluno_tutor(tutor_id);

-- Aulas programadas relationships  
ALTER TABLE public.aulas_programadas 
ADD CONSTRAINT fk_aulas_professor 
FOREIGN KEY (professor_id) REFERENCES public.professores(id);

CREATE INDEX idx_aulas_professor_id ON public.aulas_programadas(professor_id);
CREATE INDEX idx_aulas_data_inicio ON public.aulas_programadas(data_hora_inicio);

-- Profiles relationships
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX idx_profiles_escola_id ON public.profiles(escola_id);

-- Admin chat logs relationships
ALTER TABLE public.admin_chat_logs 
ADD CONSTRAINT fk_admin_chat_logs_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

CREATE INDEX idx_admin_chat_logs_student_id ON public.admin_chat_logs(student_id);

-- Escola modulos relationships
ALTER TABLE public.escola_modulos 
ADD CONSTRAINT fk_escola_modulos_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

ALTER TABLE public.escola_modulos 
ADD CONSTRAINT fk_escola_modulos_modulo 
FOREIGN KEY (modulo_id) REFERENCES public.modulos(id);

CREATE INDEX idx_escola_modulos_escola_id ON public.escola_modulos(escola_id);
CREATE INDEX idx_escola_modulos_modulo_id ON public.escola_modulos(modulo_id);

-- Series anos letivos relationships
ALTER TABLE public.series_anos_letivos 
ADD CONSTRAINT fk_series_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_series_escola_id ON public.series_anos_letivos(escola_id);

-- Webhooks relationships
ALTER TABLE public.webhooks 
ADD CONSTRAINT fk_webhooks_escola 
FOREIGN KEY (escola_id) REFERENCES public.escolas(id);

CREATE INDEX idx_webhooks_escola_id ON public.webhooks(escola_id);