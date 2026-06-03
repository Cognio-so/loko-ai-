create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  avatar_url text,
  theme text check (theme in ('light', 'dark', 'midnight', 'blue-neon', 'purple-ai', 'glass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_notifications boolean not null default true,
  product_updates boolean not null default true,
  private_profile boolean not null default false,
  data_sharing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  content text not null,
  category text not null default 'Discussions',
  votes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profile_settings enable row level security;
alter table public.support_tickets enable row level security;
alter table public.community_posts enable row level security;

drop policy if exists "profiles are readable by owner" on public.profiles;
create policy "profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles are upsertable by owner" on public.profiles;
create policy "profiles are upsertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles are updateable by owner" on public.profiles;
create policy "profiles are updateable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profile settings readable by owner" on public.profile_settings;
create policy "profile settings readable by owner"
  on public.profile_settings for select
  using (auth.uid() = user_id);

drop policy if exists "profile settings insertable by owner" on public.profile_settings;
create policy "profile settings insertable by owner"
  on public.profile_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "profile settings updateable by owner" on public.profile_settings;
create policy "profile settings updateable by owner"
  on public.profile_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "support tickets insertable by anyone" on public.support_tickets;
create policy "support tickets insertable by anyone"
  on public.support_tickets for insert
  with check (true);

drop policy if exists "users can read own support tickets" on public.support_tickets;
create policy "users can read own support tickets"
  on public.support_tickets for select
  using (email = (select email from auth.users where id = auth.uid()));

drop policy if exists "community posts readable by anyone" on public.community_posts;
create policy "community posts readable by anyone"
  on public.community_posts for select
  using (true);

drop policy if exists "community posts insertable by anyone" on public.community_posts;
create policy "community posts insertable by anyone"
  on public.community_posts for insert
  with check (author_id is null or auth.uid() = author_id);

drop policy if exists "community posts updateable by author" on public.community_posts;
create policy "community posts updateable by author"
  on public.community_posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatar files are publicly readable" on storage.objects;
create policy "avatar files are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatars" on storage.objects;
create policy "users can upload own avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own avatars" on storage.objects;
create policy "users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
