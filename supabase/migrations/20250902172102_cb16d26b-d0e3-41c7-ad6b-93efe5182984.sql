-- Fix security issues from materialized view exposure

-- 1) Ensure materialized view is not exposed in API by revoking from anon/authenticated roles
REVOKE ALL ON mv_user_progress FROM anon;
REVOKE ALL ON mv_user_progress FROM authenticated;

-- 2) Only allow service_role to access it directly (for refresh operations)
GRANT SELECT ON mv_user_progress TO service_role;