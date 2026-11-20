-- Bứt Phá assessment storage. Client roles have no direct table access.
create table if not exists public.breakthrough_rooms (
  room_code text primary key,
  teacher_token_hash text not null,
  captains jsonb not null default '{}'::jsonb,
  assigned jsonb not null default '{}'::jsonb,
  closes_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.breakthrough_submissions (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.breakthrough_rooms(room_code) on delete cascade,
  team_index smallint not null check (team_index between 0 and 3),
  scenario_index smallint not null check (scenario_index between 0 and 7),
  version integer not null check (version > 0),
  captain_peer text not null,
  answer text not null check (char_length(answer) between 1 and 8000),
  criteria jsonb,
  total_score smallint check (total_score between 0 and 100),
  feedback jsonb,
  status text not null check (status in ('assessed','manual_review','confirmed')),
  teacher_score smallint check (teacher_score between 0 and 100),
  teacher_note text,
  created_at timestamptz not null default now(),
  unique (room_code, team_index, version)
);
create index if not exists breakthrough_submissions_latest
  on public.breakthrough_submissions(room_code, team_index, version desc);
alter table public.breakthrough_rooms enable row level security;
alter table public.breakthrough_submissions enable row level security;
revoke all on public.breakthrough_rooms from anon, authenticated;
revoke all on public.breakthrough_submissions from anon, authenticated;
grant all on public.breakthrough_rooms to service_role;
grant all on public.breakthrough_submissions to service_role;
