-- LokoAI Public Schema
-- Authenticated, owner-scoped project storage with RLS
-- Run this in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Drop existing tables if they exist and recreate with new structure
drop table if exists public.generations cascade;
drop table if exists public.presentations cascade;
drop table if exists public.projects cascade;
drop table if exists public.profiles cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  full_name text,
  avatar_url text,
  theme text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Design',
  description text,
  prompt text, -- original user prompt that created this design
  generated_code jsonb not null default '[]'::jsonb,
  preview_html text, -- Full self-contained HTML for live preview
  chat_messages jsonb not null default '[]'::jsonb, -- Chat history per project
  session_key text,
  sandbox_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.presentations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Presentation',
  prompt text not null,
  file_name text not null,
  file_url text not null,
  file_size integer not null default 0,
  slide_count integer not null default 12,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.presentations enable row level security;

-- Profiles policies (auth users only for their own profile)
drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id) with check (auth.uid() = id);

-- Projects policies - owner-scoped access only
drop policy if exists "Projects are publicly readable" on public.projects;
drop policy if exists "Projects are readable by owner" on public.projects;
create policy "Projects are readable by owner"
on public.projects for select using (auth.uid() = user_id);

drop policy if exists "Projects are publicly insertable" on public.projects;
drop policy if exists "Projects are insertable by owner" on public.projects;
create policy "Projects are insertable by owner"
on public.projects for insert with check (auth.uid() = user_id);

drop policy if exists "Projects are publicly updatable" on public.projects;
drop policy if exists "Projects are updatable by owner" on public.projects;
create policy "Projects are updatable by owner"
on public.projects for update
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Projects are publicly deletable" on public.projects;
drop policy if exists "Projects are deletable by owner" on public.projects;
create policy "Projects are deletable by owner"
on public.projects for delete using (auth.uid() = user_id);

drop policy if exists "Presentations are readable by owner" on public.presentations;
create policy "Presentations are readable by owner"
on public.presentations for select using (auth.uid() = user_id);

drop policy if exists "Presentations are insertable by owner" on public.presentations;
create policy "Presentations are insertable by owner"
on public.presentations for insert with check (auth.uid() = user_id);

drop policy if exists "Presentations are updatable by owner" on public.presentations;
create policy "Presentations are updatable by owner"
on public.presentations for update
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Presentations are deletable by owner" on public.presentations;
create policy "Presentations are deletable by owner"
on public.presentations for delete using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
before update on public.projects
for each row execute function public.update_updated_at();

drop trigger if exists presentations_updated_at on public.presentations;
create trigger presentations_updated_at
before update on public.presentations
for each row execute function public.update_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at();

-- Profile creation trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    username = coalesce(public.profiles.username, excluded.username),
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Indexes
create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists projects_user_id_idx on public.projects (user_id) where user_id is not null;
create index if not exists presentations_created_at_idx on public.presentations (created_at desc);
create index if not exists presentations_user_id_idx on public.presentations (user_id);
