-- Cross-device sync for signed-in (Google) accounts: task list + pokedex.
-- Run this once in the Supabase SQL editor (in addition to schema.sql and
-- account.sql). Requires Google sign-in to already be configured (see
-- account.sql for those steps).
--
-- Design: a signed-in user's whole task list is backed up here, keyed by their
-- auth account (auth.uid()). Row level security is on with NO policies, so the
-- anon key can't touch the table - reads and writes go through the two
-- security-definer functions below, which only ever act on the caller's own
-- row. Conflicts resolve last-write-wins by updated_at, handled on the client.

create table if not exists task_lists (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table task_lists enable row level security;

-- Upsert the signed-in account's task list (called with a user JWT). Returns
-- the server timestamp so the client can track which side is newer.
create or replace function push_tasks(p_data jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_ts timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  if pg_column_size(p_data) > 200000 then
    raise exception 'task list too large';
  end if;
  insert into task_lists (user_id, data, updated_at)
  values (v_uid, p_data, now())
  on conflict (user_id)
  do update set data = excluded.data, updated_at = now()
  returning updated_at into v_ts;
  return v_ts;
end;
$$;

-- Fetch the signed-in account's backed-up task list (null when none yet).
create or replace function get_tasks()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('data', data, 'updated_at', updated_at)
  from task_lists
  where user_id = auth.uid();
$$;

revoke all on function push_tasks (jsonb) from public;
revoke all on function get_tasks () from public;
grant execute on function push_tasks (jsonb) to authenticated;
grant execute on function get_tasks () to authenticated;

-- ---------------------------------------------------------------------------
-- Pokedex sync: discoveries (all + shiny) and registered "special" pokemon.
-- Unlike tasks, pokedex progress only ever grows, so the client unions the two
-- sides together instead of picking a winner - order and timing don't matter.
-- ---------------------------------------------------------------------------

create table if not exists dex_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table dex_data enable row level security;

-- Upsert the signed-in account's pokedex progress (the client sends the merged
-- superset, so this is a plain overwrite).
create or replace function push_dex(p_data jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  if pg_column_size(p_data) > 200000 then
    raise exception 'pokedex too large';
  end if;
  insert into dex_data (user_id, data, updated_at)
  values (v_uid, p_data, now())
  on conflict (user_id)
  do update set data = excluded.data, updated_at = now();
end;
$$;

-- Fetch the signed-in account's pokedex progress (null when none yet).
create or replace function get_dex()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select data from dex_data where user_id = auth.uid();
$$;

revoke all on function push_dex (jsonb) from public;
revoke all on function get_dex () from public;
grant execute on function push_dex (jsonb) to authenticated;
grant execute on function get_dex () to authenticated;

-- ---------------------------------------------------------------------------
-- Desktop UI prefs sync: the editable banner image, title, and Spotify embed
-- link shown on the desktop dashboard. Last-write-wins by updated_at, handled
-- on the client. (The banner is a downscaled data URL, hence the larger cap.)
-- ---------------------------------------------------------------------------

create table if not exists ui_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table ui_prefs enable row level security;

create or replace function push_ui(p_data jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_ts timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  if pg_column_size(p_data) > 3000000 then
    raise exception 'ui prefs too large';
  end if;
  insert into ui_prefs (user_id, data, updated_at)
  values (v_uid, p_data, now())
  on conflict (user_id)
  do update set data = excluded.data, updated_at = now()
  returning updated_at into v_ts;
  return v_ts;
end;
$$;

create or replace function get_ui()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('data', data, 'updated_at', updated_at)
  from ui_prefs
  where user_id = auth.uid();
$$;

revoke all on function push_ui (jsonb) from public;
revoke all on function get_ui () from public;
grant execute on function push_ui (jsonb) to authenticated;
grant execute on function get_ui () to authenticated;

-- ---------------------------------------------------------------------------
-- Desktop calendar sync: assignments (with their generated pokemon) + classes.
-- Last-write-wins by updated_at, handled on the client.
-- ---------------------------------------------------------------------------

create table if not exists cal_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table cal_data enable row level security;

create or replace function push_cal(p_data jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_ts timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  if pg_column_size(p_data) > 500000 then
    raise exception 'calendar too large';
  end if;
  insert into cal_data (user_id, data, updated_at)
  values (v_uid, p_data, now())
  on conflict (user_id)
  do update set data = excluded.data, updated_at = now()
  returning updated_at into v_ts;
  return v_ts;
end;
$$;

create or replace function get_cal()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('data', data, 'updated_at', updated_at)
  from cal_data
  where user_id = auth.uid();
$$;

revoke all on function push_cal (jsonb) from public;
revoke all on function get_cal () from public;
grant execute on function push_cal (jsonb) to authenticated;
grant execute on function get_cal () to authenticated;

-- ---------------------------------------------------------------------------
-- Profile sync: companion pokemon + pokepark message. Single-value settings,
-- so the client resolves them last-write-wins by updated_at, like tasks.
-- ---------------------------------------------------------------------------

create table if not exists prefs_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table prefs_data enable row level security;

create or replace function push_prefs(p_data jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_ts timestamptz;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'not signed in';
  end if;
  if pg_column_size(p_data) > 20000 then
    raise exception 'prefs too large';
  end if;
  insert into prefs_data (user_id, data, updated_at)
  values (v_uid, p_data, now())
  on conflict (user_id)
  do update set data = excluded.data, updated_at = now()
  returning updated_at into v_ts;
  return v_ts;
end;
$$;

create or replace function get_prefs()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('data', data, 'updated_at', updated_at)
  from prefs_data
  where user_id = auth.uid();
$$;

revoke all on function push_prefs (jsonb) from public;
revoke all on function get_prefs () from public;
grant execute on function push_prefs (jsonb) to authenticated;
grant execute on function get_prefs () to authenticated;
