-- Adicionar novos campos à tabela escolas
ALTER TABLE public.escolas 
ADD COLUMN nome_fantasia TEXT,
ADD COLUMN razao_social TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN celular TEXT,
ADD COLUMN endereco TEXT,
ADD COLUMN numero TEXT,
ADD COLUMN complemento TEXT,
ADD COLUMN bairro TEXT,
ADD COLUMN cidade TEXT,
ADD COLUMN uf TEXT,
ADD COLUMN cep TEXT,
ADD COLUMN email TEXT;