
-- Compatibility views (idempotent) to preserve legacy contracts and hide sensitive data

-- 1) Professores without password_hash
CREATE OR REPLACE VIEW public.professores_publico AS
SELECT
  p.id,
  p.escola_id,
  p.nome,
  p.email,
  p.codigo,
  p.ativo
FROM public.professores p;

-- 2) Chats with canonical owner_id
-- Note: our schema has chats.user_id (text). We expose it as owner_id for compatibility.
CREATE OR REPLACE VIEW public.chats_v AS
SELECT
  c.id,
  c.user_id AS owner_id,
  c.title,
  c.created_at,
  c.updated_at
FROM public.chats c;

-- 3) Messages with canonical names
-- role <- sender, content <- message
-- image_urls <- array built from single attachment_url (if present)
-- feedback <- NULL placeholder to match expected shape
CREATE OR REPLACE VIEW public.messages_v AS
SELECT
  m.id,
  m.chat_id,
  m.user_id,
  m.sender AS role,
  m.message AS content,
  CASE
    WHEN m.attachment_url IS NOT NULL THEN ARRAY[m.attachment_url]::text[]
    ELSE ARRAY[]::text[]
  END AS image_urls,
  NULL::text AS feedback,
  m.created_at
FROM public.messages m;

-- 4) Exercises view aligned to current catalog
-- content <- question
-- publica <- true (compat placeholder)
-- topic_id <- NULL (not present in exercises)
CREATE OR REPLACE VIEW public.exercises_v AS
SELECT
  e.id,
  e.title,
  e.question AS content,
  TRUE AS publica,
  NULL::uuid AS topic_id
FROM public.exercises e;

-- Minimal GRANTS for the views
GRANT SELECT ON public.professores_publico TO authenticated;
GRANT SELECT ON public.chats_v TO authenticated;
GRANT SELECT ON public.messages_v TO authenticated;
GRANT SELECT ON public.exercises_v TO authenticated;
