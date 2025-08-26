-- Corrigir o profile do coordenador "Diretor Demo" para ter o escola_id correto
UPDATE profiles 
SET escola_id = (
  SELECT escola_id 
  FROM coordenadores 
  WHERE email = (
    SELECT email 
    FROM auth.users 
    WHERE id = profiles.user_id
  )
)
WHERE user_id = 'a834079b-d01f-4694-a630-d20fc350c02c'
  AND role = 'coordinator'
  AND escola_id IS NULL;