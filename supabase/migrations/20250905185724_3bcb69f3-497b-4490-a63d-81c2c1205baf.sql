-- Criar a escola Almeida Garrett se não existir
INSERT INTO escolas (nome, codigo, ativa) 
VALUES ('Colégio Almeida Garrett', 'almeida-garrett', true)
ON CONFLICT (codigo) DO NOTHING;

-- Obter o ID da escola
DO $$
DECLARE
  escola_id_var UUID;
  modulo_chat UUID;
  modulo_exercicios UUID;
  modulo_jornada UUID;
  modulo_redacao UUID;
BEGIN
  -- Obter o ID da escola
  SELECT id INTO escola_id_var FROM escolas WHERE codigo = 'almeida-garrett';
  
  -- Obter IDs dos módulos
  SELECT id INTO modulo_chat FROM modulos WHERE codigo = 'chat';
  SELECT id INTO modulo_exercicios FROM modulos WHERE codigo = 'exercicios';
  SELECT id INTO modulo_jornada FROM modulos WHERE codigo = 'jornada';
  SELECT id INTO modulo_redacao FROM modulos WHERE codigo = 'redacao';
  
  -- Ativar todos os módulos para a escola
  INSERT INTO escola_modulos (escola_id, modulo_id, ativo)
  VALUES 
    (escola_id_var, modulo_chat, true),
    (escola_id_var, modulo_exercicios, true),
    (escola_id_var, modulo_jornada, true),
    (escola_id_var, modulo_redacao, false)  -- Redação desabilitada como mostrado na imagem
  ON CONFLICT (escola_id, modulo_id) DO UPDATE SET
    ativo = EXCLUDED.ativo;
END $$;