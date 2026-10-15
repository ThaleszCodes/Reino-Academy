-- Team rank must depend on the ministry entitlement, never on which
-- member is currently making the request. Internal helper, not a public RPC.
create or replace function private.rank_for(mid uuid)
returns integer language sql stable security definer set search_path=''
as $function$
 select case
  when mid is null then 0
  when exists (
    select 1 from public.ministries m
    join auth.users owner_user on owner_user.id=m.owner_id
    join private.admin_emails a on lower(owner_user.email)=lower(a.email)
    where m.id=mid and owner_user.email_confirmed_at is not null
  ) then 3
  else coalesce((select max(plan_id) from private.purchases where ministry_id=mid and status='paid'),0)
 end
$function$;
revoke all on function private.rank_for(uuid) from public, anon, authenticated;
