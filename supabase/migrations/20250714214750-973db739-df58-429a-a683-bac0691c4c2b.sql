-- Criar algumas listas de exercícios
INSERT INTO public.exercise_lists (title, description, subject, difficulty, exercise_ids) VALUES
('Matemática Básica', 'Exercícios fundamentais de matemática', 'Matemática', 'easy', 
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'Matemática')),

('Física Clássica', 'Conceitos básicos de mecânica e energia', 'Física', 'medium',
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'Física')),

('Química Geral', 'Fundamentos de química', 'Química', 'medium',
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'Química')),

('Biologia Celular', 'Estudo das células e processos biológicos', 'Biologia', 'easy',
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'Biologia')),

('História do Brasil', 'Principais eventos da história brasileira', 'História', 'easy',
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'História')),

('Geografia Física', 'Aspectos físicos e climáticos', 'Geografia', 'easy',
 (SELECT ARRAY_AGG(id) FROM exercises WHERE subject = 'Geografia'));