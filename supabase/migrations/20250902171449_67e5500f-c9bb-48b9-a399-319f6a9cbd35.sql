
-- 0) Safety: ensure RLS is enabled on these tables
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 1) Schema changes: ensure columns exist (idempotent)
-- 1a) Add chats.owner_id (uuid), keep nullable for smooth migration, set default for future inserts
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS owner_id uuid;

ALTER TABLE public.chats
  ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- 1b) Messages.user_id as uuid (only if not already present; if it exists with another type, this is a no-op)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 1c) Messages.feedback with like/dislike options
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS feedback text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'messages'
      AND tc.constraint_name = 'messages_feedback_check'
  ) THEN
    EXECUTE 'ALTER TABLE public.messages ADD CONSTRAINT messages_feedback_check CHECK (feedback IN (''like'',''dislike''))';
  END IF;
END
$$;

-- 2) Backfill (only when messages.user_id is uuid and null)
-- If your existing messages.user_id is TEXT, this block safely does nothing.
DO $$
DECLARE
  v_is_uuid boolean;
BEGIN
  SELECT (c.data_type = 'uuid')
    INTO v_is_uuid
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = 'messages'
    AND c.column_name = 'user_id';

  IF v_is_uuid THEN
    EXECUTE $i$
      UPDATE public.messages m
      SET user_id = c.owner_id
      FROM public.chats c
      WHERE m.chat_id = c.id
        AND m.user_id IS NULL
        AND c.owner_id IS NOT NULL
    $i$;
  END IF;
END
$$;

-- 3) RLS policies (unify to owner-based OR legacy text-based)
-- 3a) Chats policies: drop legacy policy (if present) and create unified one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chats'
      AND policyname = 'Users can manage their own chats'
  ) THEN
    EXECUTE 'DROP POLICY "Users can manage their own chats" ON public.chats';
  END IF;
END
$$;

-- Allow full access to rows where the caller owns the chat (auth) or matches legacy user_id = CURRENT_USER
CREATE POLICY chats_owner_or_legacy_all
ON public.chats
FOR ALL
USING (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (user_id = CURRENT_USER)
)
WITH CHECK (
  (owner_id IS NOT NULL AND owner_id = auth.uid())
  OR (user_id = CURRENT_USER)
);

-- 3b) Messages policies: drop legacy ones (if present) and create unified one
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Users can create their own messages'
  ) THEN
    EXECUTE 'DROP POLICY "Users can create their own messages" ON public.messages';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'messages'
      AND policyname = 'Users can view their own messages'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view their own messages" ON public.messages';
  END IF;
END
$$;

-- Single unified policy for SELECT/INSERT/UPDATE/DELETE via owner-or-legacy checks
CREATE POLICY messages_owner_or_legacy_all
ON public.messages
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.chats c
    WHERE c.id = public.messages.chat_id
      AND (
        (c.owner_id IS NOT NULL AND c.owner_id = auth.uid())
        OR (c.user_id = CURRENT_USER)
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.chats c
    WHERE c.id = public.messages.chat_id
      AND (
        (c.owner_id IS NOT NULL AND c.owner_id = auth.uid())
        OR (c.user_id = CURRENT_USER)
      )
  )
);

-- 4) Indexes for performance
CREATE INDEX IF NOT EXISTS msg_chat_created_idx ON public.messages (chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chats_owner_updated_idx ON public.chats (owner_id, updated_at DESC);

-- 5) Trigger to keep chats.last_message_at updated on message inserts (uses existing function)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_messages_set_chats_last_message_at'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_messages_set_chats_last_message_at
      AFTER INSERT ON public.messages
      FOR EACH ROW
      EXECUTE FUNCTION public.set_chats_last_message_at()
    ';
  END IF;
END
$$;

-- Notes:
-- - chats.owner_id stays NULL for existing rows, preserving legacy access via user_id = CURRENT_USER.
-- - New rows can set owner_id automatically via DEFAULT auth.uid() when using authenticated sessions.
-- - messages.feedback supports ''like''/''dislike''; UPDATE is allowed for owners via the unified policy.
