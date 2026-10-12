-- HUELLITAS: esquema inicial multiusuario para Supabase
-- Ejecutar en SQL Editor de un proyecto Supabase NUEVO.
create extension if not exists pgcrypto;
create table if not exists public.pets (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 100),
 species text not null default 'Perro',
 breed text, birth_date date, sex text, notes text,
 created_at timestamptz not null default now()
);
create table if not exists public.pet_members (
 pet_id uuid not null references public.pets(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('family','caregiver')),
 created_at timestamptz not null default now(),
 primary key(pet_id,user_id)
);
create table if not exists public.pet_records (
 id uuid primary key default gen_random_uuid(),
 pet_id uuid not null references public.pets(id) on delete cascade,
 category text not null check(category in ('appointment','vaccine','medication','weight','expense','note','reminder')),
 title text not null check(length(trim(title)) between 1 and 150),
 event_date date, event_time time,
 amount numeric(12,2) check(amount is null or amount >= 0),
 currency text check(currency in ('CRC','USD')),
 details text, created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists pets_owner_idx on public.pets(owner_id);
create index if not exists pet_members_user_idx on public.pet_members(user_id);
create index if not exists pet_records_pet_idx on public.pet_records(pet_id);
-- SECURITY DEFINER avoids recursive RLS evaluation for membership checks.
create or replace function public.can_access_pet(p uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(select 1 from public.pets where id=p and owner_id=(select auth.uid()))
 or exists(select 1 from public.pet_members where pet_id=p and user_id=(select auth.uid()));
$$;
create or replace function public.can_edit_pet(p uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(select 1 from public.pets where id=p and owner_id=(select auth.uid()))
 or exists(select 1 from public.pet_members where pet_id=p and user_id=(select auth.uid()) and role='family');
$$;
create or replace function public.owns_pet(p uuid)
returns boolean language sql stable security definer
set search_path = '' as $$
 select exists(select 1 from public.pets where id=p and owner_id=(select auth.uid()));
$$;
revoke all on function public.can_access_pet(uuid),public.can_edit_pet(uuid),public.owns_pet(uuid) from public;
grant execute on function public.can_access_pet(uuid),public.can_edit_pet(uuid),public.owns_pet(uuid) to authenticated;
alter table public.pets enable row level security;
alter table public.pet_members enable row level security;
alter table public.pet_records enable row level security;
create policy "pets select" on public.pets for select to authenticated using (public.can_access_pet(id));
create policy "pets insert" on public.pets for insert to authenticated with check (owner_id=(select auth.uid()));
create policy "pets update" on public.pets for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "pets delete" on public.pets for delete to authenticated using(owner_id=(select auth.uid()));
create policy "members select" on public.pet_members for select to authenticated using(public.can_access_pet(pet_id));
create policy "members insert" on public.pet_members for insert to authenticated with check(public.owns_pet(pet_id) and user_id<>(select auth.uid()));
create policy "members update" on public.pet_members for update to authenticated using(public.owns_pet(pet_id)) with check(public.owns_pet(pet_id));
create policy "members delete" on public.pet_members for delete to authenticated using(public.owns_pet(pet_id));
create policy "records select" on public.pet_records for select to authenticated using(public.can_access_pet(pet_id));
create policy "records insert" on public.pet_records for insert to authenticated with check(public.can_edit_pet(pet_id) and created_by=(select auth.uid()));
create policy "records update" on public.pet_records for update to authenticated using(public.can_edit_pet(pet_id)) with check(public.can_edit_pet(pet_id));
create policy "records delete" on public.pet_records for delete to authenticated using(public.can_edit_pet(pet_id));
-- IMPORTANT: Invites must be accepted via a verified server-side flow.
-- Do not expose arbitrary user lookups or service_role keys in the browser.
