begin;
-- Disposable, synthetic fixtures only; every change is rolled back.
insert into auth.users(id,email,email_confirmed_at,aud,role) values
('00000000-0000-4000-a000-000000000101','ra-regression-owner@example.invalid',now(),'authenticated','authenticated'),
('00000000-0000-4000-a000-000000000102','ra-regression-member@example.invalid',now(),'authenticated','authenticated'),
('00000000-0000-4000-a000-000000000103','ra-regression-other@example.invalid',now(),'authenticated','authenticated');
insert into private.admin_emails values('ra-regression-owner@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000101',true);
do $test$
declare w jsonb; tok text;
begin
 w:=public.ra_action('onboard','{"name":"Regression ministry","display_name":"Owner"}');
 if (w->>'seats')::int<>20 then raise exception 'Owner must have 20 team seats'; end if;
 tok:=public.ra_action('invite','{"email":"ra-regression-member@example.invalid"}')->>'token';
 perform set_config('ra.regression_token',tok,true);
end $test$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000103',true);
do $test$
begin
 begin
  perform public.ra_action('accept_invite',jsonb_build_object('token',current_setting('ra.regression_token'),'display_name','Other'));
  raise exception 'Wrong-email acceptance bypass';
 exception when others then
  if sqlerrm<>'Convite inválido, expirado ou destinado a outro e-mail.' then raise; end if;
 end;
 perform public.ra_action('onboard','{"name":"Unrelated ministry","display_name":"Other"}');
 if private.my_rank()<>0 then raise exception 'Unpaid unrelated ministry got access'; end if;
end $test$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000102',true);
do $test$
declare w jsonb;
begin
 perform public.ra_action('accept_invite',jsonb_build_object('token',current_setting('ra.regression_token'),'display_name','Member'));
 w:=public.ra_action('claim');
 if (w->>'plan_id')::int<>3 or (w->>'seats')::int<>20 or w->>'role'<>'member' then raise exception 'Invitee did not inherit team entitlement'; end if;
 if (w->>'is_admin')::bool or private.is_admin() then raise exception 'Invitee gained admin privileges'; end if;
 if jsonb_array_length(w->'members')<>2 then raise exception 'Membership missing'; end if;
 if not exists(select 1 from public.lessons) then raise exception 'Invited member cannot read lessons'; end if;
 begin
  perform public.ra_action('invite','{"email":"unauthorized@example.invalid"}');
  raise exception 'Member gained invite privileges';
 exception when others then
  if sqlerrm<>'Somente o responsável pode convidar.' then raise; end if;
 end;
end $test$;
reset role;
delete from private.admin_emails where email='ra-regression-owner@example.invalid';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000102',true);
do $test$
begin
 if private.my_rank()<>0 or exists(select 1 from public.lessons) then raise exception 'Revoked ministry entitlement persisted'; end if;
end $test$;
reset role;
select 'PASS: shared entitlement, email binding, member restrictions and revocation' as result;
rollback;
