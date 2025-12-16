-- Tabla mínima para auditoría de links de invitación emitidos por el bot
-- Requiere extensión pgcrypto para gen_random_uuid() (en Supabase suele estar disponible).

create table if not exists public.telegram_user_invites (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null,
  chat_id bigint not null,
  invite_link text not null,
  created_at timestamptz not null default now(),
  used_at timestamptz null
);

-- FK al usuario (si se elimina el usuario, eliminamos su historial de invites)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'telegram_user_invites_telegram_user_id_fkey'
  ) then
    alter table public.telegram_user_invites
      add constraint telegram_user_invites_telegram_user_id_fkey
      foreign key (telegram_user_id)
      references public.telegram_users(telegram_id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_telegram_user_invites_user_id on public.telegram_user_invites (telegram_user_id);
create index if not exists idx_telegram_user_invites_created_at on public.telegram_user_invites (created_at desc);


