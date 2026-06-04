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

alter table public.presentations enable row level security;

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

drop trigger if exists presentations_updated_at on public.presentations;
create trigger presentations_updated_at
before update on public.presentations
for each row execute function public.update_updated_at();

create index if not exists presentations_created_at_idx on public.presentations (created_at desc);
create index if not exists presentations_user_id_idx on public.presentations (user_id);
