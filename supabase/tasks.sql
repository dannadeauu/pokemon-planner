-- Cross-device task sync for signed-in (Google) accounts.
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
