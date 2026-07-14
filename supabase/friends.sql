-- Friend requests + mutual friendships.
-- Run this once in the Supabase SQL editor (after schema.sql and account.sql).
--
-- Model: entering someone's code sends them a pending request. A trainer's
-- team is only visible to another trainer once they've accepted, and the
-- friendship is mutual - accepting makes both teams visible to each other.

create table if not exists friendships (
  requester_id uuid not null references trainers (id) on delete cascade,
  addressee_id uuid not null references trainers (id) on delete cascade,
  status text not null default 'pending', -- 'pending' | 'accepted'
  created_at timestamptz not null default now(),
  primary key (requester_id, addressee_id)
);

create index if not exists friendships_addressee_idx on friendships (addressee_id);

alter table friendships enable row level security;

-- Send a request from me (code+secret) to another trainer's code. If they
-- already requested me, this accepts instead (mutual). Returns the friend's
-- nickname and the resulting status ('pending' or 'accepted').
create or replace function send_friend_request(p_code text, p_secret uuid, p_friend_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_friend uuid;
  v_nick text;
  v_status text;
begin
  select id into v_me from trainers where code = p_code and secret = p_secret;
  if v_me is null then raise exception 'unknown trainer or bad secret'; end if;
  select id, nickname into v_friend, v_nick from trainers where code = p_friend_code;
  if v_friend is null then raise exception 'no trainer found with that code'; end if;
  if v_friend = v_me then raise exception 'that is your own code'; end if;

  -- already requested them / already friends
  select status into v_status from friendships
    where requester_id = v_me and addressee_id = v_friend;
  if found then
    return json_build_object('nickname', v_nick, 'status', v_status);
  end if;

  -- they already requested me -> accept, becomes mutual
  if exists (select 1 from friendships where requester_id = v_friend and addressee_id = v_me) then
    update friendships set status = 'accepted'
      where requester_id = v_friend and addressee_id = v_me;
    return json_build_object('nickname', v_nick, 'status', 'accepted');
  end if;

  insert into friendships (requester_id, addressee_id, status)
  values (v_me, v_friend, 'pending');
  return json_build_object('nickname', v_nick, 'status', 'pending');
end;
$$;

-- List my accepted friends (with their team snapshots) and the incoming
-- pending requests (trainers who added my code but I haven't accepted).
create or replace function list_friends(p_code text, p_secret uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
begin
  select id into v_me from trainers where code = p_code and secret = p_secret;
  if v_me is null then raise exception 'unknown trainer or bad secret'; end if;

  return json_build_object(
    'friends', coalesce((
      select json_agg(json_build_object(
        'code', t.code,
        'nickname', t.nickname,
        'snapshot', tm.snapshot
      ))
      from friendships f
      join trainers t
        on t.id = case when f.requester_id = v_me then f.addressee_id else f.requester_id end
      left join teams tm on tm.trainer_id = t.id
      where f.status = 'accepted' and (f.requester_id = v_me or f.addressee_id = v_me)
    ), '[]'::json),
    'requests', coalesce((
      select json_agg(json_build_object('code', t.code, 'nickname', t.nickname))
      from friendships f
      join trainers t on t.id = f.requester_id
      where f.status = 'pending' and f.addressee_id = v_me
    ), '[]'::json)
  );
end;
$$;

-- Accept or decline an incoming request from p_requester_code.
create or replace function respond_friend_request(p_code text, p_secret uuid, p_requester_code text, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_req uuid;
begin
  select id into v_me from trainers where code = p_code and secret = p_secret;
  if v_me is null then raise exception 'unknown trainer or bad secret'; end if;
  select id into v_req from trainers where code = p_requester_code;
  if v_req is null then raise exception 'no trainer found with that code'; end if;
  if p_accept then
    update friendships set status = 'accepted'
      where requester_id = v_req and addressee_id = v_me and status = 'pending';
  else
    delete from friendships
      where requester_id = v_req and addressee_id = v_me and status = 'pending';
  end if;
end;
$$;

-- Remove a friend (either direction, any status).
create or replace function remove_friend(p_code text, p_secret uuid, p_friend_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid;
  v_friend uuid;
begin
  select id into v_me from trainers where code = p_code and secret = p_secret;
  if v_me is null then raise exception 'unknown trainer or bad secret'; end if;
  select id into v_friend from trainers where code = p_friend_code;
  if v_friend is null then return; end if;
  delete from friendships
    where (requester_id = v_me and addressee_id = v_friend)
       or (requester_id = v_friend and addressee_id = v_me);
end;
$$;

revoke all on function send_friend_request (text, uuid, text) from public;
revoke all on function list_friends (text, uuid) from public;
revoke all on function respond_friend_request (text, uuid, text, boolean) from public;
revoke all on function remove_friend (text, uuid, text) from public;
grant execute on function send_friend_request (text, uuid, text) to anon, authenticated;
grant execute on function list_friends (text, uuid) to anon, authenticated;
grant execute on function respond_friend_request (text, uuid, text, boolean) to anon, authenticated;
grant execute on function remove_friend (text, uuid, text) to anon, authenticated;
