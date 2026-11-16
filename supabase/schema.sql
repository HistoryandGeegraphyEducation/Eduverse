-- EDUVERSE + CAREER ARENA: shared identity schema
-- Run this file once in Supabase Dashboard > SQL Editor.
-- Existing CAREER ARENA Realtime tables/channels are not modified by this schema.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'pending'
    check (role in ('admin','teacher','student','pending')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_single_admin
  on public.profiles (role) where role = 'admin';

create or replace function public.is_eduverse_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_eduverse_admin() from public;
grant execute on function public.is_eduverse_admin() to authenticated;

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_eduverse_admin() then
    if new.id is distinct from old.id
      or new.role is distinct from old.role
      or new.email is distinct from old.email
      or new.created_at is distinct from old.created_at then
      raise exception 'Không được tự thay đổi vai trò hoặc thông tin định danh.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
before update on public.profiles
for each row execute function public.protect_profile_fields();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id,email,full_name,role)
  values (
    new.id,
    coalesce(new.email,''),
    coalesce(new.raw_user_meta_data ->> 'full_name',''),
    'pending'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = coalesce(new.email,'') where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_auth_user_email();

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_eduverse_admin());

drop policy if exists "Users can update own basic profile" on public.profiles;
create policy "Users can update own basic profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()) or public.is_eduverse_admin())
with check (id = (select auth.uid()) or public.is_eduverse_admin());

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
on public.profiles for select to authenticated
using (public.is_eduverse_admin());

grant select, update on public.profiles to authenticated;

-- ONE-TIME ADMIN ASSIGNMENT:
-- 1) Register the intended administrator through EDUVERSE first.
-- 2) Replace the email below with that exact, verified email.
-- 3) Run this statement separately as the Supabase project owner.
-- The unique index prevents creating a second admin.
-- update public.profiles
-- set role = 'admin'
-- where lower(email) = lower('ADMIN_EMAIL_HERE');

-- Teacher/student role assignment remains an administrative operation.
-- New registrations stay at role='pending' until a policy is agreed.
