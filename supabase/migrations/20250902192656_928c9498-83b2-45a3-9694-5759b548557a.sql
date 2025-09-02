-- Update school administrator role from 'admin' to 'school_admin'
UPDATE profiles 
SET role = 'school_admin', updated_at = now()
WHERE user_id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN ('diretor@launs.com.br')
);