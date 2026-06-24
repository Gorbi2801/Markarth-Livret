create table if not exists public.mk_missives (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (length(trim(subject)) between 1 and 160),
  body text not null check (length(trim(body)) between 1 and 5000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mk_missives_sender_idx on public.mk_missives(sender_id, created_at desc);
create index if not exists mk_missives_recipient_idx on public.mk_missives(recipient_id, created_at desc);

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.mk_profiles
    where user_id = auth.uid()
      and is_superadmin = true
  );
$$;

revoke all on function public.is_superadmin() from public;
grant execute on function public.is_superadmin() to authenticated;

alter table public.mk_missives enable row level security;

drop policy if exists "read own missives or admin" on public.mk_missives;
create policy "read own missives or admin"
on public.mk_missives
for select
to authenticated
using (
  sender_id = auth.uid()
  or recipient_id = auth.uid()
  or public.is_superadmin()
);

drop policy if exists "send own missives" on public.mk_missives;
create policy "send own missives"
on public.mk_missives
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and recipient_id <> auth.uid()
);

drop policy if exists "mark own received missives read" on public.mk_missives;
create policy "mark own received missives read"
on public.mk_missives
for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

revoke all on public.mk_missives from anon;
revoke update on public.mk_missives from authenticated;
grant select, insert on public.mk_missives to authenticated;
grant update(read_at) on public.mk_missives to authenticated;

create or replace view public.mk_missive_recipients as
select
  p.user_id,
  p.username,
  p.display_name,
  g.prenom,
  g.nom,
  g.grade
from public.mk_profiles p
left join public.mk_gardes g on g.user_id = p.user_id
where p.user_id is not null;

revoke all on public.mk_missive_recipients from public;
grant select on public.mk_missive_recipients to authenticated;
