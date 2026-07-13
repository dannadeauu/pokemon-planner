-- Account features: nickname changes + Google sign-in backup/restore.
-- Run this once in the Supabase SQL editor (in addition to schema.sql).
--
-- To make the "sign in with google" button work you also need to enable the
-- Google provider: Supabase dashboard -> Authentication -> Sign In / Up ->
-- Google (it asks for an OAuth client id + secret from Google Cloud
-- Console), and add your app's URL (the GitHub Pages address) under
-- Authentication -> URL Configuration -> Redirect URLs.

alter table trainers add column if not exists user_id uuid unique;

-- Rename a trainer. Requires the device's write secret.
create or replace function update_nickname(p_code text, p_secret uuid, p_nickname text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_nickname is null or length(trim(p_nickname)) = 0 or length(trim(p_nickname)) > 20 then
    raise exception 'invalid nickname';
  end if;
  update trainers set nickname = trim(p_nickname)
  where code = p_code and secret = p_secret;
  if not found then
    raise exception 'unknown trainer or bad secret';
  end if;
end;
$$;

-- Attach the signed-in account to a trainer (called with a user JWT).
-- One trainer per account: any previous link is released first.
create or replace function link_trainer(p_code text, p_secret uuid)
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
  update trainers set user_id = null where user_id = v_uid and code <> p_code;
  update trainers set user_id = v_uid where code = p_code and secret = p_secret;
  if not found then
    raise exception 'unknown trainer or bad secret';
  end if;
end;
$$;

-- Restore the signed-in account's trainer on a new device.
create or replace function get_my_trainer()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object('code', code, 'secret', secret, 'nickname', nickname)
  from trainers
  where user_id = auth.uid();
$$;

revoke all on function update_nickname (text, uuid, text) from public;
revoke all on function link_trainer (text, uuid) from public;
revoke all on function get_my_trainer () from public;
grant execute on function update_nickname (text, uuid, text) to anon, authenticated;
grant execute on function link_trainer (text, uuid) to authenticated;
grant execute on function get_my_trainer () to authenticated;
