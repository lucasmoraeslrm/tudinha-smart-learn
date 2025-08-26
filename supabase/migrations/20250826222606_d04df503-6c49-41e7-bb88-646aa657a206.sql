-- Allow school_admin and coordinator to SELECT their own school row
-- This enables SAAS per-tenant visibility for school data in the UI

-- Create SELECT policy for non-admin school users
create policy if not exists "School users can view their own school"
on public.escolas
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.escola_id = escolas.id
      and p.role in ('school_admin','coordinator')
  )
);
