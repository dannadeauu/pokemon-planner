-- Park sharing backend for the pokemon planner.
--
-- One-time setup:
--   1. Create a free project at https://supabase.com/dashboard
--   2. Open the project's "SQL Editor" and run this whole file once
--   3. Copy the project URL and the anon ("publishable") key from
--      Project Settings -> API into SUPABASE_URL / SUPABASE_ANON_KEY
--      near the bottom of docs/app.js and static/app.js
--
-- Design: trainer codes are public (read access to a team); each trainer
-- also gets a server-generated secret that stays in their device's
-- localStorage and is required to write. The tables have row level
-- security enabled with NO policies, so the anon key cannot touch them
-- directly - every read and write goes through the three functions below.

create table trainers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nickname text not null,
  secret uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table teams (
  trainer_id uuid primary key references trainers (id) on delete cascade,
  snapshot jsonb not null,
  updated_at timestamptz not null default now()
);

alter table trainers enable row level security;
alter table teams enable row level security;

-- Register a trainer: generates a unique 12-digit code and a write secret.
create or replace function create_trainer(p_nickname text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trainer trainers;
  v_code text;
begin
  if p_nickname is null or length(trim(p_nickname)) = 0 or length(trim(p_nickname)) > 20 then
    raise exception 'invalid nickname';
  end if;
  loop
    v_code := lpad(floor(random() * 10000)::int::text, 4, '0') || '-' ||
              lpad(floor(random() * 10000)::int::text, 4, '0') || '-' ||
              lpad(floor(random() * 10000)::int::text, 4, '0');
    begin
      insert into trainers (code, nickname)
      values (v_code, trim(p_nickname))
      returning * into v_trainer;
      exit;
    exception when unique_violation then
      -- code collision: loop and roll a new one
    end;
  end loop;
  return json_build_object('code', v_trainer.code, 'secret', v_trainer.secret);
end;
$$;

-- Upsert the caller's team snapshot. Requires the write secret.
create or replace function push_team(p_code text, p_secret uuid, p_snapshot jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from trainers where code = p_code and secret = p_secret;
  if v_id is null then
    raise exception 'unknown trainer or bad secret';
  end if;
  if pg_column_size(p_snapshot) > 20000 then
    raise exception 'snapshot too large';
  end if;
  insert into teams (trainer_id, snapshot, updated_at)
  values (v_id, p_snapshot, now())
  on conflict (trainer_id)
  do update set snapshot = excluded.snapshot, updated_at = now();
end;
$$;

-- Look up a trainer's team by their public code. Returns null when the
-- code doesn't exist; snapshot is null when they haven't synced yet.
create or replace function get_team(p_code text)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'nickname', t.nickname,
    'snapshot', tm.snapshot,
    'updated_at', tm.updated_at
  )
  from trainers t
  left join teams tm on tm.trainer_id = t.id
  where t.code = p_code;
$$;

revoke all on function create_trainer (text) from public;
revoke all on function push_team (text, uuid, jsonb) from public;
revoke all on function get_team (text) from public;
grant execute on function create_trainer (text) to anon;
grant execute on function push_team (text, uuid, jsonb) to anon;
grant execute on function get_team (text) to anon;
