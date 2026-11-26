-- Exhibition prototype schema. Run in Supabase SQL Editor.
create table if not exists public.rooms (
  room_code text primary key,
  status text not null default 'lobby' check (status in ('lobby','running','finished')),
  score_a integer not null default 0,
  score_b integer not null default 0,
  rope_position integer not null default 50,
  time_left integer not null default 90,
  round_no integer not null default 0,
  question_a text not null default 'Waiting…',
  question_b text not null default 'Waiting…',
  answer_a text not null default '',
  answer_b text not null default '',
  winner text,
  created_at timestamptz not null default now()
);
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(room_code) on delete cascade,
  team text not null check (team in ('A','B')),
  nickname text not null default 'Player',
  joined_at timestamptz not null default now()
);
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms(room_code) on delete cascade,
  team text not null check (team in ('A','B')),
  round_no integer not null,
  answer text not null,
  created_at timestamptz not null default now()
);
-- Demo-only permissive policies for a supervised college exhibition.
alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.answers enable row level security;
drop policy if exists "demo rooms access" on public.rooms;
create policy "demo rooms access" on public.rooms for all to anon, authenticated using (true) with check (true);
drop policy if exists "demo players access" on public.players;
create policy "demo players access" on public.players for all to anon, authenticated using (true) with check (true);
drop policy if exists "demo answers access" on public.answers;
create policy "demo answers access" on public.answers for all to anon, authenticated using (true) with check (true);
-- Enable Realtime for the tables used by host and phone browsers.
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.answers;
