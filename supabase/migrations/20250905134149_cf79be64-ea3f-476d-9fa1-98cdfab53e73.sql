-- Criar tabela para histórico de temas ENEM
CREATE TABLE public.temas_enem_historico (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ano integer NOT NULL,
  titulo text NOT NULL,
  categoria_tematica text,
  dificuldade text NOT NULL DEFAULT 'medio',
  palavras_chave text[] DEFAULT ARRAY[]::text[],
  textos_auxiliares_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.temas_enem_historico ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura por todos
CREATE POLICY "Temas ENEM histórico são públicos" 
ON public.temas_enem_historico 
FOR SELECT 
USING (true);

-- Política para admins gerenciarem
CREATE POLICY "Admins podem gerenciar temas ENEM histórico" 
ON public.temas_enem_historico 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Inserir dados fornecidos
INSERT INTO public.temas_enem_historico (id, ano, titulo, categoria_tematica, dificuldade, palavras_chave, textos_auxiliares_count, created_at) VALUES
('819ae381-81fc-4243-a10c-af85ca8645b8', 2023, 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', null, 'dificil', ARRAY['trabalho de cuidado', 'invisibilidade feminina', 'divisão sexual do trabalho', 'desigualdade de gênero', 'trabalho não remunerado'], 4, '2025-08-05T13:11:28.915828+00:00'),
('70c9507d-4445-4d42-9a15-c3a8938f63e6', 2023, 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', 'desigualdade_genero', 'medio', ARRAY['trabalho de cuidado', 'invisibilidade', 'mulher', 'desigualdade', 'economia'], 3, '2025-08-03T15:28:49.103243+00:00'),
('64b24b37-c3a7-4adc-94f8-a19813369323', 2022, 'Desafios para a valorização de comunidades e povos tradicionais no Brasil', null, 'medio', ARRAY['povos tradicionais', 'comunidades tradicionais', 'valorização cultural', 'diversidade', 'sustentabilidade'], 4, '2025-08-05T13:11:28.915828+00:00'),
('b6fd9487-5a52-4cfb-aa43-f96d3cb75755', 2022, 'Desafios para a valorização de comunidades e povos tradicionais no Brasil', 'diversidade_cultural', 'medio', ARRAY['povos tradicionais', 'diversidade', 'cultura', 'território', 'preservação'], 2, '2025-08-03T15:28:49.103243+00:00'),
('7be8958a-eb9d-4138-97ea-304797360348', 2021, 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil', null, 'medio', ARRAY['registro civil', 'cidadania', 'invisibilidade social', 'documentação', 'direitos básicos'], 4, '2025-08-05T13:11:28.915828+00:00'),
('c0f14ba3-20d4-4bb8-a6bd-8ee54a5b95db', 2020, 'O estigma associado às doenças mentais na sociedade brasileira', null, 'dificil', ARRAY['saúde mental', 'estigma', 'preconceito', 'doenças mentais', 'tabu social'], 4, '2025-08-05T13:11:28.915828+00:00'),
('b27090c6-8abd-4bb5-9938-0179cc5db21c', 2019, 'Democratização do acesso ao cinema no Brasil', null, 'medio', ARRAY['democratização', 'acesso ao cinema', 'cultura', 'desigualdade cultural', 'direito à arte'], 4, '2025-08-05T13:11:28.915828+00:00'),
('89dc28aa-758b-4863-b0aa-f2930348192a', 2018, 'Manipulação do comportamento do usuário pelo controle de dados na internet', null, 'dificil', ARRAY['manipulação digital', 'controle de dados', 'algoritmos', 'comportamento online', 'privacidade digital'], 3, '2025-08-05T13:18:12.236695+00:00'),
('bcd3f984-c08a-4e02-8c9b-927bce8e50d3', 2017, 'Desafios para a formação educacional de surdos no Brasil', null, 'medio', ARRAY['educação de surdos', 'Libras', 'educação inclusiva', 'educação bilíngue', 'acessibilidade educacional'], 4, '2025-08-05T13:18:12.236695+00:00'),
('ba82f1e9-897a-4e17-a3a8-eaa1ff155d9a', 2016, 'Caminhos para combater a intolerância religiosa no Brasil', null, 'dificil', ARRAY['intolerância religiosa', 'liberdade de crença', 'diversidade religiosa', 'religiões de matriz africana', 'tolerância'], 4, '2025-08-05T13:18:12.236695+00:00'),
('4b4b3a87-1a03-4816-9034-b7378eafc691', 2015, 'A persistência da violência contra a mulher na sociedade brasileira', null, 'dificil', ARRAY['violência contra a mulher', 'feminicídio', 'Lei Maria da Penha', 'sociedade machista', 'igualdade de gênero'], 4, '2025-08-05T13:18:12.236695+00:00'),
('05091bcb-5112-489c-af65-45064f72343e', 2014, 'Publicidade infantil em questão no Brasil', null, 'medio', ARRAY['publicidade infantil', 'consumismo', 'proteção da criança', 'influência publicitária', 'responsabilidade parental'], 4, '2025-08-05T13:18:12.236695+00:00');

-- Criar índices para melhor performance
CREATE INDEX idx_temas_enem_historico_ano ON public.temas_enem_historico(ano);
CREATE INDEX idx_temas_enem_historico_dificuldade ON public.temas_enem_historico(dificuldade);
CREATE INDEX idx_temas_enem_historico_categoria ON public.temas_enem_historico(categoria_tematica);