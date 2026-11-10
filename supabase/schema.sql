-- SERIES 001 — database, storage and Row Level Security.
-- Run this whole file once in Supabase -> SQL Editor. It is safe to re-run.
-- Afterwards run supabase/owner.sql (see README) to make yourself the owner.

-- ---------------------------------------------------------------- owners --
-- Only users listed here can manage content. Nobody can add themselves:
-- there are no insert/update/delete policies, so rows can only be added from
-- the SQL editor (which runs as the database owner).
create table if not exists public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.owners enable row level security;

drop policy if exists "owners can read themselves" on public.owners;
create policy "owners can read themselves" on public.owners
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.owners where user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

-- ----------------------------------------------------------------- posts --
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 120),
  caption       text not null default '' check (char_length(caption) <= 280),
  description   text not null default '' check (char_length(description) <= 5000),
  category      text not null check (category in ('graphic-design', 'photography', 'video', 'experiments')),
  media_type    text not null check (media_type in ('image', 'video')),
  media_url     text not null,
  media_path    text,                 -- storage object path, used to clean up on delete
  poster_url    text,                 -- video thumbnail
  poster_path   text,
  aspect_ratio  numeric not null default 1 check (aspect_ratio > 0.1 and aspect_ratio < 10),
  status        text not null default 'draft' check (status in ('draft', 'published')),
  published_at  timestamptz not null default now(),
  like_count    integer not null default 0 check (like_count >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_feed_idx on public.posts (status, published_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts" on public.posts
  for select to anon, authenticated
  using (status = 'published' or public.is_owner());

drop policy if exists "owner inserts posts" on public.posts;
create policy "owner inserts posts" on public.posts
  for insert to authenticated with check (public.is_owner());

drop policy if exists "owner updates posts" on public.posts;
create policy "owner updates posts" on public.posts
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "owner deletes posts" on public.posts;
create policy "owner deletes posts" on public.posts
  for delete to authenticated using (public.is_owner());

-- -------------------------------------------------------------- comments --
create table if not exists public.comments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts (id) on delete cascade,
  author_name  text not null check (char_length(btrim(author_name)) between 1 and 40),
  body         text not null check (char_length(btrim(body)) between 1 and 500),
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "public reads visible comments" on public.comments;
create policy "public reads visible comments" on public.comments
  for select to anon, authenticated
  using (
    public.is_owner()
    or (
      is_hidden = false
      and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
    )
  );

drop policy if exists "public adds comments to published posts" on public.comments;
create policy "public adds comments to published posts" on public.comments
  for insert to anon, authenticated
  with check (
    is_hidden = false
    and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published')
  );

drop policy if exists "owner moderates comments" on public.comments;
create policy "owner moderates comments" on public.comments
  for update to authenticated using (public.is_owner()) with check (public.is_owner());

drop policy if exists "owner deletes comments" on public.comments;
create policy "owner deletes comments" on public.comments
  for delete to authenticated using (public.is_owner());

-- ----------------------------------------------------------------- likes --
-- Visitors are anonymous, so a like is keyed by a random per-browser id.
-- The table has RLS on and no policies: it can only be touched through the
-- functions below, which keeps visitor ids private and counts consistent.
create table if not exists public.likes (
  post_id     uuid not null references public.posts (id) on delete cascade,
  visitor_id  uuid not null,
  created_at  timestamptz not null default now(),
  primary key (post_id, visitor_id)
);
alter table public.likes enable row level security;

create or replace function public.toggle_like(p_post uuid, p_visitor uuid)
returns table (liked boolean, total integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total integer;
begin
  if not exists (select 1 from public.posts where id = p_post and status = 'published') then
    raise exception 'post not found';
  end if;

  delete from public.likes where post_id = p_post and visitor_id = p_visitor;
  if found then
    update public.posts set like_count = greatest(like_count - 1, 0)
      where id = p_post returning like_count into v_total;
    return query select false, v_total;
  else
    insert into public.likes (post_id, visitor_id) values (p_post, p_visitor);
    update public.posts set like_count = like_count + 1
      where id = p_post returning like_count into v_total;
    return query select true, v_total;
  end if;
end;
$$;
revoke all on function public.toggle_like(uuid, uuid) from public;
grant execute on function public.toggle_like(uuid, uuid) to anon, authenticated;

create or replace function public.my_liked_posts(p_visitor uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select post_id from public.likes where visitor_id = p_visitor;
$$;
revoke all on function public.my_liked_posts(uuid) from public;
grant execute on function public.my_liked_posts(uuid) to anon, authenticated;

-- --------------------------------------------------------------- storage --
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
        'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: anyone can fetch a file by URL. Only the owner can write.
drop policy if exists "owner uploads media" on storage.objects;
create policy "owner uploads media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_owner());

drop policy if exists "owner reads media" on storage.objects;
create policy "owner reads media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_owner());

drop policy if exists "owner updates media" on storage.objects;
create policy "owner updates media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_owner());

drop policy if exists "owner deletes media" on storage.objects;
create policy "owner deletes media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_owner());
