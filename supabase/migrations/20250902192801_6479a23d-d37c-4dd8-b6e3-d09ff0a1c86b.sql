-- Update school administrator role from 'admin' to 'coordinator'
UPDATE profiles 
SET role = 'coordinator', updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN ('diretor@launs.com.br')
);