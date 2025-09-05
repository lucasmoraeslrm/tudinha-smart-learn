-- Ativar módulos para a escola do estudante atual (Colégio Colag)
DO $$
DECLARE
  escola_id_var UUID := '717d101e-351d-4351-a093-1c39046d3eea';
  modulo_chat UUID;
  modulo_exercicios UUID;
  modulo_jornada UUID;
  modulo_redacao UUID;
BEGIN
  -- Obter IDs dos módulos
  SELECT id INTO modulo_chat FROM modulos WHERE codigo = 'chat';
  SELECT id INTO modulo_exercicios FROM modulos WHERE codigo = 'exercicios';
  SELECT id INTO modulo_jornada FROM modulos WHERE codigo = 'jornada';
  SELECT id INTO modulo_redacao FROM modulos WHERE codigo = 'redacao';
  
  -- Ativar módulos para a escola do estudante atual
  INSERT INTO escola_modulos (escola_id, modulo_id, ativo)
  VALUES 
    (escola_id_var, modulo_chat, true),
    (escola_id_var, modulo_exercicios, true),
    (escola_id_var, modulo_jornada, true),
    (escola_id_var, modulo_redacao, false)  -- Redação desabilitada
  ON CONFLICT (escola_id, modulo_id) DO UPDATE SET
    ativo = EXCLUDED.ativo;
END $$;