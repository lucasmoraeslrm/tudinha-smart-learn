-- Adicionar mais exercícios de diferentes matérias
INSERT INTO public.exercises (title, subject, question, options, correct_answer, explanation, difficulty) VALUES

-- Matemática
('Equação do Segundo Grau', 'Matemática', 'Qual é a solução da equação x² - 5x + 6 = 0?', '["x = 2 e x = 3", "x = 1 e x = 6", "x = -2 e x = -3", "x = 0 e x = 5"]', 'x = 2 e x = 3', 'Usando a fórmula de Bhaskara: x = (5 ± √(25-24))/2 = (5 ± 1)/2, obtemos x = 3 ou x = 2', 'medium'),

('Trigonometria Básica', 'Matemática', 'Qual é o valor de sen(30°)?', '["1/2", "√3/2", "√2/2", "1"]', '1/2', 'O seno de 30 graus é um dos valores notáveis da trigonometria: sen(30°) = 1/2', 'easy'),

('Logaritmo', 'Matemática', 'Qual é o valor de log₂(8)?', '["2", "3", "4", "8"]', '3', 'log₂(8) = 3, pois 2³ = 8', 'medium'),

-- Física
('Velocidade Média', 'Física', 'Um carro percorre 120 km em 2 horas. Qual sua velocidade média?', '["50 km/h", "60 km/h", "70 km/h", "80 km/h"]', '60 km/h', 'Velocidade média = distância/tempo = 120 km / 2 h = 60 km/h', 'easy'),

('Segunda Lei de Newton', 'Física', 'Se uma força de 10 N atua sobre um objeto de 2 kg, qual é sua aceleração?', '["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"]', '5 m/s²', 'Pela segunda lei de Newton: F = ma, então a = F/m = 10N / 2kg = 5 m/s²', 'medium'),

('Energia Cinética', 'Física', 'Qual é a energia cinética de um objeto de 4 kg movendo-se a 10 m/s?', '["100 J", "200 J", "400 J", "800 J"]', '200 J', 'Energia cinética: Ec = (1/2)mv² = (1/2) × 4 × 10² = 200 J', 'medium'),

-- Química
('Tabela Periódica', 'Química', 'Qual é o símbolo químico do ouro?', '["Au", "Ag", "Al", "Ar"]', 'Au', 'O símbolo químico do ouro é Au, derivado do latim aurum', 'easy'),

('Ligações Químicas', 'Química', 'Que tipo de ligação ocorre entre Na e Cl no NaCl?', '["Covalente", "Iônica", "Metálica", "Van der Waals"]', 'Iônica', 'NaCl forma uma ligação iônica, onde o Na⁺ doa um elétron para o Cl⁻', 'medium'),

('pH e pOH', 'Química', 'Se o pH de uma solução é 3, qual é seu pOH?', '["11", "7", "3", "14"]', '11', 'pH + pOH = 14, então se pH = 3, pOH = 14 - 3 = 11', 'medium'),

-- Biologia
('Células', 'Biologia', 'Qual é a diferença principal entre células procarióticas e eucarióticas?', '["Presença de núcleo organizado", "Tamanho da célula", "Presença de DNA", "Capacidade de reprodução"]', 'Presença de núcleo organizado', 'Células eucarióticas possuem núcleo organizado (carioteca), enquanto procarióticas não', 'easy'),

('Fotossíntese', 'Biologia', 'Qual é a equação básica da fotossíntese?', '["6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O", "CO₂ + H₂O → O₂ + glucose", "6O₂ + C₆H₁₂O₆ → 6CO₂ + 6H₂O"]', '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', 'A fotossíntese converte CO₂ e água em glicose e oxigênio, na presença de luz', 'medium'),

('Genética', 'Biologia', 'Quantos cromossomos possui uma célula humana normal?', '["23", "46", "44", "48"]', '46', 'Células humanas normais possuem 46 cromossomos (23 pares)', 'easy'),

-- História
('Brasil Colônia', 'História', 'Em que ano foi assinada a Lei Áurea?', '["1888", "1889", "1887", "1890"]', '1888', 'A Lei Áurea foi assinada pela Princesa Isabel em 13 de maio de 1888', 'easy'),

('Revolução Francesa', 'História', 'Qual foi o lema da Revolução Francesa?', '["Liberdade, Igualdade, Fraternidade", "Paz, Amor e União", "Trabalho, Ordem e Progresso", "Deus, Pátria e Família"]', 'Liberdade, Igualdade, Fraternidade', 'O lema da Revolução Francesa era "Liberté, Égalité, Fraternité"', 'easy'),

('Segunda Guerra Mundial', 'História', 'Em que ano terminou a Segunda Guerra Mundial?', '["1944", "1945", "1946", "1947"]', '1945', 'A Segunda Guerra Mundial terminou em 1945 com a rendição do Japão', 'easy'),

-- Geografia
('Capitais do Brasil', 'Geografia', 'Qual é a capital do estado de Minas Gerais?', '["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem"]', 'Belo Horizonte', 'Belo Horizonte é a capital de Minas Gerais desde 1897', 'easy'),

('Hidrografia', 'Geografia', 'Qual é o maior rio do mundo em extensão?', '["Rio Amazonas", "Rio Nilo", "Rio Mississippi", "Rio Yangtzé"]', 'Rio Nilo', 'O Rio Nilo, com cerca de 6.650 km, é considerado o mais longo do mundo', 'medium'),

('Clima', 'Geografia', 'Qual tipo de clima predomina na região amazônica?', '["Tropical úmido", "Tropical semiárido", "Subtropical", "Temperado"]', 'Tropical úmido', 'A Amazônia possui clima tropical úmido, com altas temperaturas e chuvas abundantes', 'easy');

-- Criar tabela para listas de exercícios
CREATE TABLE public.exercise_lists (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    subject text NOT NULL,
    difficulty text DEFAULT 'medium',
    exercise_ids uuid[] NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.exercise_lists ENABLE ROW LEVEL SECURITY;

-- Criar política para que todos possam ver as listas
CREATE POLICY "Everyone can view exercise lists" 
ON public.exercise_lists 
FOR SELECT 
USING (true);

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

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_exercise_lists_updated_at
BEFORE UPDATE ON public.exercise_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar tabela student_answers para incluir list_id
ALTER TABLE public.student_answers 
ADD COLUMN list_id uuid REFERENCES public.exercise_lists(id);

-- Criar índices para melhor performance
CREATE INDEX idx_exercise_lists_subject ON public.exercise_lists(subject);
CREATE INDEX idx_student_answers_list_id ON public.student_answers(list_id);
CREATE INDEX idx_student_answers_student_exercise ON public.student_answers(student_id, exercise_id);