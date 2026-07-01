-- Pièces jointes image pour les rapports de renseignements.
-- A lancer dans le SQL editor Supabase.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'renseignements',
  'renseignements',
  false,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

create table if not exists public.mk_rens_attachments (
  id uuid primary key default gen_random_uuid(),
  rapport_id uuid not null references public.mk_rens_rapports(id) on delete cascade,
  bucket_id text not null default 'renseignements',
  path text not null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint mk_rens_attachments_bucket_check check (bucket_id = 'renseignements'),
  constraint mk_rens_attachments_mime_check check (
    mime_type is null
    or mime_type in ('image/jpeg','image/png','image/webp','image/gif')
  )
);

create index if not exists mk_rens_attachments_rapport_idx
on public.mk_rens_attachments(rapport_id, created_at asc);

create index if not exists mk_rens_attachments_created_by_idx
on public.mk_rens_attachments(created_by, created_at desc);

alter table public.mk_rens_attachments enable row level security;

drop policy if exists "read rens attachments" on public.mk_rens_attachments;
create policy "read rens attachments"
on public.mk_rens_attachments
for select
to authenticated
using (public.can_access_section('renseignements'));

drop policy if exists "create rens attachments" on public.mk_rens_attachments;
create policy "create rens attachments"
on public.mk_rens_attachments
for insert
to authenticated
with check (
  created_by = auth.uid()
  and bucket_id = 'renseignements'
  and public.can_access_section('renseignements')
  and exists (
    select 1
    from public.mk_rens_rapports r
    where r.id = rapport_id
      and (
        r.created_by = auth.uid()
        or public.can_edit_section('renseignements')
      )
  )
);

drop policy if exists "delete own rens attachments" on public.mk_rens_attachments;
create policy "delete own rens attachments"
on public.mk_rens_attachments
for delete
to authenticated
using (
  created_by = auth.uid()
  or public.can_edit_section('renseignements')
);

revoke all on public.mk_rens_attachments from anon;
revoke all on public.mk_rens_attachments from authenticated;
grant select on public.mk_rens_attachments to authenticated;
grant insert(rapport_id, bucket_id, path, file_name, mime_type, file_size, created_by)
on public.mk_rens_attachments to authenticated;
grant delete on public.mk_rens_attachments to authenticated;

drop policy if exists "read renseignement images" on storage.objects;
create policy "read renseignement images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'renseignements'
  and public.can_access_section('renseignements')
);

drop policy if exists "upload renseignement images" on storage.objects;
create policy "upload renseignement images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'renseignements'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.can_access_section('renseignements')
);

drop policy if exists "delete renseignement images" on storage.objects;
create policy "delete renseignement images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'renseignements'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.can_edit_section('renseignements')
  )
);
