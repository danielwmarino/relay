-- ============================================================
-- RELAY — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- PROFILES
-- Extends Supabase's built-in auth.users table with public info.
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  display_name text,
  bio         text,
  created_at  timestamptz default now() not null
);

-- POSTS
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 500),
  created_at timestamptz default now() not null
);

-- FOLLOWS
create table public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)  -- can't follow yourself
);

-- ============================================================
-- INDEXES — speed up common queries
-- ============================================================
create index on public.posts (author_id, created_at desc);
create index on public.follows (follower_id);
create index on public.follows (following_id);

-- ============================================================
-- ROW-LEVEL SECURITY (RLS)
-- Supabase requires this — it controls who can read/write what.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts    enable row level security;
alter table public.follows  enable row level security;

-- PROFILES policies
create policy "Profiles are public"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- POSTS policies
create policy "Posts are public"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- FOLLOWS policies
create policy "Follows are public"
  on public.follows for select using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- When a user signs up, automatically create their profile row.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    -- Use email prefix as default username (they can change it later)
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
