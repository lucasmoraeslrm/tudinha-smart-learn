-- Update professor password to use SHA-256 hash
UPDATE professores 
SET password_hash = sha256_hash('101010')
WHERE codigo = 'PROF001';