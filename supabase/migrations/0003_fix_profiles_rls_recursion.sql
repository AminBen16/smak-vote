-- Fix infinite recursion (Postgres 42P17) in profiles RLS policies.
-- The original policies referenced the profiles table from within a profiles
-- policy (and admin checks on other tables cascade back into profiles RLS),
-- causing "infinite recursion detected in policy for relation profiles".
-- Replace the self-referential admin/role checks with a SECURITY DEFINER
-- helper that reads the caller's role while bypassing RLS.

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- profiles policies (no longer self-referential)
drop policy if exists profiles_self on profiles;
drop policy if exists profiles_self_update on profiles;
drop policy if exists profiles_insert_admin on profiles;

create policy profiles_self on profiles for select
  using (auth.uid() = id or public.current_user_role() = 'admin');
create policy profiles_self_update on profiles for update
  using (auth.uid() = id or public.current_user_role() = 'admin');
create policy profiles_insert_admin on profiles for insert
  with check (public.current_user_role() = 'admin');

-- Other tables' admin checks rebuilt on the helper so they no longer
-- re-enter profiles RLS (which would re-trigger the recursion).
drop policy if exists elections_admin on elections;
create policy elections_admin on elections for all
  using (public.current_user_role() = 'admin');

drop policy if exists positions_admin on positions;
create policy positions_admin on positions for all
  using (public.current_user_role() = 'admin');

drop policy if exists candidates_admin on candidates;
create policy candidates_admin on candidates for all
  using (public.current_user_role() in ('admin', 'officer'));

drop policy if exists voter_status_admin on voter_status;
create policy voter_status_admin on voter_status for all
  using (public.current_user_role() in ('admin', 'officer'));

drop policy if exists votes_insert_admin on votes;
create policy votes_insert_admin on votes for insert
  with check (public.current_user_role() in ('admin', 'officer'));

drop policy if exists audit_logs_public on audit_logs;
create policy audit_logs_public on audit_logs for select
  using (public.current_user_role() in ('admin', 'officer'));

drop policy if exists audit_logs_admin on audit_logs;
create policy audit_logs_admin on audit_logs for insert
  with check (public.current_user_role() = 'admin');

drop policy if exists voting_tokens_admin on voting_tokens;
drop policy if exists voting_tokens_admin_select on voting_tokens;
drop policy if exists voting_tokens_admin_write on voting_tokens;
create policy voting_tokens_admin_select on voting_tokens for select
  using (public.current_user_role() = 'admin');
create policy voting_tokens_admin_write on voting_tokens for all
  using (public.current_user_role() = 'admin');
