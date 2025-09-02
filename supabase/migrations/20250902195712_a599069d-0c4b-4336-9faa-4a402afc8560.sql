-- Corrigir dados do estudante para permitir login com RA ou código
-- Atualizar student_auth para usar senha correta e permitir login com RA também

-- Primeiro, atualizar a senha do estudante c001/001 para usar a senha correta
UPDATE student_auth 
SET password_hash = sha256_hash('101010')
WHERE codigo = '001';

-- Criar entrada adicional para permitir login com RA 'c001' 
INSERT INTO student_auth (codigo, password_hash, student_id, created_at, updated_at)
SELECT 'c001', sha256_hash('101010'), s.id, NOW(), NOW()
FROM students s 
WHERE s.codigo = '001'
AND NOT EXISTS (SELECT 1 FROM student_auth WHERE codigo = 'c001');