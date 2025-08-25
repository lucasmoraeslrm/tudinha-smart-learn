
-- 1) Tabela de conversas (chats)
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'Novo chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  deleted_at timestamptz
);

alter table public.chats enable row level security;

-- Políticas simples (compatíveis com o padrão atual do projeto)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can view chats'
  ) then
    create policy "Users can view chats" on public.chats for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can insert chats'
  ) then
    create policy "Users can insert chats" on public.chats for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can update chats'
  ) then
    create policy "Users can update chats" on public.chats for update using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'chats' and policyname = 'Users can delete chats'
  ) then
    create policy "Users can delete chats" on public.chats for delete using (true);
  end if;
end$$;

-- Trigger para manter updated_at em chats
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_chats_updated_at'
  ) then
    create trigger set_chats_updated_at
    before update on public.chats
    for each row execute function public.update_updated_at_column();
  end if;
end$$;

-- 2) Ajustes na tabela messages para múltiplos chats e anexos
alter table public.messages add column if not exists chat_id uuid references public.chats(id) on delete cascade;
alter table public.messages add column if not exists attachment_url text;
alter table public.messages add column if not exists attachment_type text;
alter table public.messages add column if not exists attachment_name text;

create index if not exists idx_messages_chat_id on public.messages(chat_id);

-- Atualiza last_message_at do chat quando chega nova mensagem
create or replace function public.set_chats_last_message_at()
returns trigger
language plpgsql
as $$
begin
  if new.chat_id is not null then
    update public.chats
    set last_message_at = now(),
        updated_at = now()
    where id = new.chat_id;
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'on_message_insert_update_chat'
  ) then
    create trigger on_message_insert_update_chat
    after insert on public.messages
    for each row
    execute function public.set_chats_last_message_at();
  end if;
end$$;

-- 3) Migrar mensagens antigas (sem chat_id) para um chat "Chat antigo" por user_id
-- Cria um chat por user_id para mensagens que ainda não possuem chat
insert into public.chats (user_id, title, created_at, updated_at, last_message_at)
select
  m.user_id,
  'Chat antigo',
  min(m.created_at),
  now(),
  max(m.created_at)
from public.messages m
where m.chat_id is null
group by m.user_id
having not exists (
  select 1 from public.chats c
  where c.user_id = m.user_id and c.title = 'Chat antigo'
);

-- Vincula mensagens antigas ao chat "Chat antigo"
update public.messages m
set chat_id = c.id
from public.chats c
where m.chat_id is null
  and c.user_id = m.user_id
  and c.title = 'Chat antigo';

-- 4) Bucket do Storage para anexos do chat
insert into storage.buckets (id, name, public)
values ('chat-uploads', 'chat-uploads', true)
on conflict (id) do nothing;

-- Políticas do bucket (público para leitura; inserir e deletar liberados para manter compatibilidade com o app sem auth)
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for chat uploads'
  ) then
    create policy "Public read for chat uploads"
    on storage.objects for select
    using (bucket_id = 'chat-uploads');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can upload chat files'
  ) then
    create policy "Anyone can upload chat files"
    on storage.objects for insert
    with check (bucket_id = 'chat-uploads');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Anyone can delete chat files'
  ) then
    create policy "Anyone can delete chat files"
    on storage.objects for delete
    using (bucket_id = 'chat-uploads');
  end if;
end$$;
