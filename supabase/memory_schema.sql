-- ============================================================
-- LOKO AI - 4 Memory Types Schema
-- Run this in Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- 1. SHORT-TERM MEMORY (conversation history)
create table if not exists public.short_term_memory (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  user_id text,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  agent_name text default 'loko',
  created_at timestamptz default now()
);

create index if not exists idx_short_term_session on public.short_term_memory(session_id);
create index if not exists idx_short_term_created on public.short_term_memory(created_at);
create index if not exists idx_short_term_agent on public.short_term_memory(agent_name);

-- 2. LONG-TERM MEMORY (user preferences + durable knowledge)
create table if not exists public.long_term_memory (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  key text not null,
  value jsonb not null,
  category text default 'preference',
  agent_name text default 'loko',
  updated_at timestamptz default now(),
  unique(user_id, key, agent_name)
);

create index if not exists idx_long_term_user on public.long_term_memory(user_id);
create index if not exists idx_long_term_key on public.long_term_memory(key);
create index if not exists idx_long_term_agent on public.long_term_memory(agent_name);

-- 3. EPISODIC MEMORY (important past events)
create table if not exists public.episodic_memory (
  id uuid default gen_random_uuid() primary key,
  user_id text,
  session_id text,
  event_type text not null,
  description text not null,
  outcome text,
  importance integer default 5 check (importance between 1 and 10),
  agent_name text default 'loko',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_episodic_user on public.episodic_memory(user_id);
create index if not exists idx_episodic_type on public.episodic_memory(event_type);
create index if not exists idx_episodic_importance on public.episodic_memory(importance desc);
create index if not exists idx_episodic_agent on public.episodic_memory(agent_name);

-- 4. WORKING MEMORY (current task state)
create table if not exists public.working_memory (
  id uuid default gen_random_uuid() primary key,
  session_id text not null unique,
  user_id text,
  current_task text,
  agent_name text default 'loko',
  context jsonb default '{}',
  steps jsonb default '[]',
  updated_at timestamptz default now()
);

create index if not exists idx_working_session on public.working_memory(session_id);
create index if not exists idx_working_agent on public.working_memory(agent_name);

create or replace function public.cleanup_short_term_memory()
returns void as $$
begin
  delete from public.short_term_memory
  where created_at < now() - interval '24 hours';
end;
$$ language plpgsql;
