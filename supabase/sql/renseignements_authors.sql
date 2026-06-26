alter table public.mk_rens_fiches
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.mk_rens_rapports
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists created_by_name text,
  add column if not exists created_by_grade text;

create index if not exists mk_rens_fiches_created_by_idx
on public.mk_rens_fiches(created_by, created_at desc);

create index if not exists mk_rens_rapports_created_by_idx
on public.mk_rens_rapports(created_by, created_at desc);

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
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

create or replace function public.can_access_section(section_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.mk_profiles p
      where p.user_id = auth.uid()
        and to_jsonb(p.sections) ? section_key
    );
$$;

revoke all on function public.can_access_section(text) from public;
grant execute on function public.can_access_section(text) to authenticated;

create or replace function public.can_edit_section(section_key text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_superadmin()
    or exists (
      select 1
      from public.mk_profiles p
      where p.user_id = auth.uid()
        and to_jsonb(p.sections_edit) ? section_key
    );
$$;

revoke all on function public.can_edit_section(text) from public;
grant execute on function public.can_edit_section(text) to authenticated;

alter table public.mk_rens_fiches enable row level security;
alter table public.mk_rens_rapports enable row level security;
alter table public.mk_rens_relations enable row level security;

drop policy if exists "read rens fiches" on public.mk_rens_fiches;
create policy "read rens fiches"
on public.mk_rens_fiches
for select
to authenticated
using (public.can_access_section('renseignements'));

drop policy if exists "create rens fiches" on public.mk_rens_fiches;
create policy "create rens fiches"
on public.mk_rens_fiches
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.can_access_section('renseignements')
);

drop policy if exists "update own rens fiches" on public.mk_rens_fiches;
create policy "update own rens fiches"
on public.mk_rens_fiches
for update
to authenticated
using (created_by = auth.uid() or public.can_edit_section('renseignements'))
with check (created_by = auth.uid() or public.can_edit_section('renseignements'));

drop policy if exists "delete rens fiches" on public.mk_rens_fiches;
create policy "delete rens fiches"
on public.mk_rens_fiches
for delete
to authenticated
using (public.can_edit_section('renseignements'));

drop policy if exists "read rens rapports" on public.mk_rens_rapports;
create policy "read rens rapports"
on public.mk_rens_rapports
for select
to authenticated
using (public.can_access_section('renseignements'));

drop policy if exists "create rens rapports" on public.mk_rens_rapports;
create policy "create rens rapports"
on public.mk_rens_rapports
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.can_access_section('renseignements')
);

drop policy if exists "update own rens rapports" on public.mk_rens_rapports;
create policy "update own rens rapports"
on public.mk_rens_rapports
for update
to authenticated
using (created_by = auth.uid() or public.can_edit_section('renseignements'))
with check (created_by = auth.uid() or public.can_edit_section('renseignements'));

drop policy if exists "delete rens rapports" on public.mk_rens_rapports;
create policy "delete rens rapports"
on public.mk_rens_rapports
for delete
to authenticated
using (public.can_edit_section('renseignements'));

drop policy if exists "read rens relations" on public.mk_rens_relations;
create policy "read rens relations"
on public.mk_rens_relations
for select
to authenticated
using (public.can_access_section('renseignements'));

drop policy if exists "create rens relations" on public.mk_rens_relations;
create policy "create rens relations"
on public.mk_rens_relations
for insert
to authenticated
with check (public.can_access_section('renseignements'));

drop policy if exists "delete rens relations" on public.mk_rens_relations;
create policy "delete rens relations"
on public.mk_rens_relations
for delete
to authenticated
using (public.can_edit_section('renseignements'));

grant select on public.mk_rens_fiches to authenticated;
grant insert(nom, type, sous_titre, type_label, statut, urgente, notes, meta, created_by) on public.mk_rens_fiches to authenticated;
grant update(nom, sous_titre, type_label, statut, urgente, notes, meta) on public.mk_rens_fiches to authenticated;
grant delete on public.mk_rens_fiches to authenticated;

grant select on public.mk_rens_rapports to authenticated;
grant insert(fiche_id, source, fiabilite, contenu, action_recommandee) on public.mk_rens_rapports to authenticated;
grant insert(created_by, created_by_name, created_by_grade) on public.mk_rens_rapports to authenticated;
grant update(source, fiabilite, contenu, action_recommandee) on public.mk_rens_rapports to authenticated;
grant delete on public.mk_rens_rapports to authenticated;

grant select on public.mk_rens_relations to authenticated;
grant insert(fiche_source, fiche_cible) on public.mk_rens_relations to authenticated;
grant delete on public.mk_rens_relations to authenticated;
