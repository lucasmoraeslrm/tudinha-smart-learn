-- Fix profiles role constraint to allow 'coordinator'
BEGIN;

-- Drop existing constraint if present
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Recreate with the allowed roles, now including 'coordinator'
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin', 'coordinator', 'parent'));

COMMIT;