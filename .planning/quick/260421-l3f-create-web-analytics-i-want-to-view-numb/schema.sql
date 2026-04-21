-- 260421-l3f analytics schema (idempotent)
-- Tables: sessions, transcripts
-- Apply via Neon SQL Console or: psql "$DATABASE_URL" -f schema.sql

create extension if not exists "pgcrypto";

create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  duration_ms   integer,
  status        text not null default 'active'
                  check (status in ('active','ended','error','abandoned')),
  error_code    text,
  error_message text,
  user_agent    text
);
create index if not exists sessions_started_at_idx on sessions(started_at desc);

create table if not exists transcripts (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  turn_index  integer not null,
  role        text not null check (role in ('user','assistant')),
  text        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists transcripts_session_created_idx
  on transcripts(session_id, created_at);
