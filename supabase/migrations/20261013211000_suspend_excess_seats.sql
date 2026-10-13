create or replace function private.seat_allowed(mid uuid,who uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select ranked.position<=p.seats from (select user_id,row_number() over(order by case when role='owner' then 0 else 1 end,created_at,user_id) as position from public.memberships where ministry_id=mid) ranked join public.plans p on p.id=private.rank_for(mid) where ranked.user_id=who),false)
$$;
revoke all on function private.seat_allowed(uuid,uuid) from public;
create or replace function private.my_rank() returns int language sql stable security definer set search_path='' as $$
 select case when auth.uid() is null then 0 when private.is_admin() then 3 when private.seat_allowed(private.my_ministry(),auth.uid()) then private.rank_for(private.my_ministry()) else 0 end
$$;
create or replace function private.action(op text, args jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mid uuid; mail text; member_role text; rank int; capacity int; inv private.invites; tok text; new_id uuid; result jsonb; target uuid;
begin
 if uid is null then raise exception 'Entre na sua conta para continuar.'; end if;
 select lower(email) into mail from auth.users where id=uid and email_confirmed_at is not null;
 if mail is null then raise exception 'Confirme seu e-mail para continuar.'; end if;
 select ministry_id,role into mid,member_role from public.memberships where user_id=uid;
 insert into public.profiles(id,display_name) values(uid,coalesce(args->>'display_name','')) on conflict(id) do nothing;
 if op='onboard' then
  if mid is not null then raise exception 'Você já participa de um ministério.'; end if;
  if length(trim(coalesce(args->>'name','')))<2 or length(trim(coalesce(args->>'display_name','')))<2 then raise exception 'Informe seu nome e o nome do ministério.'; end if;
  insert into public.ministries(name,city,owner_id) values(trim(args->>'name'),left(coalesce(args->>'city',''),100),uid) returning id into mid;
  insert into public.memberships values(uid,mid,'owner',now());
  update public.profiles set display_name=left(trim(args->>'display_name'),100) where id=uid;
  update private.purchases set ministry_id=mid where lower(email)=mail and ministry_id is null;
  insert into private.audit(actor,action,details) values(uid,op,jsonb_build_object('ministry_id',mid));
 elsif op='accept_invite' then
  if mid is not null then raise exception 'Você já participa de um ministério.'; end if;
  select * into inv from private.invites where token_hash=encode(extensions.digest(coalesce(args->>'token',''),'sha256'),'hex') and accepted_at is null and cancelled_at is null and expires_at>now();
  if inv.id is null or lower(inv.email)<>mail then raise exception 'Convite inválido, expirado ou destinado a outro e-mail.'; end if;
  perform 1 from public.ministries where id=inv.ministry_id for update;
  select * into inv from private.invites where id=inv.id and accepted_at is null and cancelled_at is null and expires_at>now() for update;
  if inv.id is null then raise exception 'Convite já utilizado ou cancelado.'; end if;
  rank:=private.rank_for(inv.ministry_id);
  select seats into capacity from public.plans where id=rank;
  if capacity is null or (select count(*) from public.memberships where ministry_id=inv.ministry_id)>=capacity then raise exception 'Não há acesso disponível neste plano.'; end if;
  insert into public.memberships values(uid,inv.ministry_id,'member',now());
  update private.invites set accepted_at=now() where id=inv.id;
  update public.profiles set display_name=left(trim(coalesce(args->>'display_name',mail)),100) where id=uid;
  mid:=inv.ministry_id;
 elsif op='claim' then
  if member_role='owner' then update private.purchases set ministry_id=mid where lower(email)=mail and ministry_id is null; end if;
 elsif op='invite' then
  if member_role is distinct from 'owner' then raise exception 'Somente o responsável pode convidar.'; end if;
  perform 1 from public.ministries where id=mid for update;
  rank:=private.rank_for(mid); select seats into capacity from public.plans where id=rank;
  if capacity is null or (select count(*) from public.memberships where ministry_id=mid)+(select count(*) from private.invites where ministry_id=mid and accepted_at is null and cancelled_at is null and expires_at>now())>=capacity then raise exception 'Todos os acessos do plano estão ocupados.'; end if;
  if coalesce(args->>'email','') !~ '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Informe um e-mail válido.'; end if;
  if exists(select 1 from private.invites where ministry_id=mid and lower(email)=lower(trim(args->>'email')) and accepted_at is null and cancelled_at is null and expires_at>now()) then raise exception 'Já existe um convite pendente para esse e-mail.'; end if;
  tok:=encode(extensions.gen_random_bytes(32),'hex');
  insert into private.invites(ministry_id,email,token_hash) values(mid,lower(trim(args->>'email')),encode(extensions.digest(tok,'sha256'),'hex'));
  return jsonb_build_object('token',tok);
 elsif op='cancel_invite' then
  if member_role is distinct from 'owner' then raise exception 'Sem permissão.'; end if;
  update private.invites set cancelled_at=now() where id=(args->>'id')::uuid and ministry_id=mid and accepted_at is null;
 elsif op='remove_member' then
  if member_role is distinct from 'owner' then raise exception 'Sem permissão.'; end if;
  target:=(args->>'id')::uuid;
  delete from public.memberships where user_id=target and ministry_id=mid and role='member';
  insert into private.audit(actor,action,details) values(uid,op,jsonb_build_object('member_id',target,'ministry_id',mid));
 elsif op='rename_ministry' then
  if member_role is distinct from 'owner' then raise exception 'Sem permissão.'; end if;
  update public.ministries set name=trim(args->>'name'),city=left(coalesce(args->>'city',''),100) where id=mid;
 elsif op='admin_settings' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  update public.settings set support_email=left(coalesce(args->>'support_email',''),200),welcome=left(coalesce(args->>'welcome',''),500) where id=true;
 elsif op='admin_offer' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  if coalesce(args->>'offer_id','')='' or coalesce(args->>'product_id','')='' then raise exception 'Informe os IDs da oferta e produto Cakto.'; end if;
  insert into private.offers values(args->>'offer_id',args->>'product_id',(args->>'plan_id')::int) on conflict(offer_id) do update set product_id=excluded.product_id,plan_id=excluded.plan_id;
  if coalesce(args->>'checkout_url','') !~ '^https://pay\.cakto\.com\.br/' then raise exception 'Use o link HTTPS do checkout Cakto.'; end if;
  update public.plans set checkout_url=args->>'checkout_url' where id=(args->>'plan_id')::int;
 elsif op='admin_resource' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  update public.resources set title=args->>'title',description=args->>'description',instructions=coalesce(args->>'instructions',''),min_plan=(args->>'min_plan')::int where id=args->>'id';
 elsif op='admin_link' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  if coalesce(args->>'url','') !~ '^https://(drive\.google\.com/|docs\.google\.com/|www\.canva\.com/|canva\.link/)' then raise exception 'Use um link HTTPS do Drive ou Canva.'; end if;
  insert into public.resource_links(resource_id,label,url) values(args->>'resource_id',args->>'label',args->>'url');
 elsif op='admin_delete_link' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  delete from public.resource_links where id=(args->>'id')::uuid;
 elsif op='admin_lesson' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  insert into public.lessons(id,module_id,title,drive_id,kind,sort_order) values('custom-'||gen_random_uuid(),args->>'module_id',args->>'title',args->>'drive_id','video',coalesce((args->>'sort_order')::int,999));
 elsif op='admin' then
  if not private.is_admin() then raise exception 'Sem permissão.'; end if;
  return jsonb_build_object('offers',coalesce((select jsonb_agg(o) from private.offers o),'[]'),'purchases',coalesce((select jsonb_agg(p) from (select order_id,email,plan_id,status,created_at from private.purchases order by created_at desc limit 100)p),'[]'),'ministries',coalesce((select jsonb_agg(m) from public.ministries m),'[]'));
 elsif op not in ('workspace','onboard','claim','accept_invite','rename_ministry') then
  raise exception 'Ação desconhecida.';
 end if;
 rank:=case when mid is null then 0 else private.rank_for(mid) end;
 select seats into capacity from public.plans where id=rank;
 return jsonb_build_object('profile',(select to_jsonb(p) from public.profiles p where id=uid),'ministry',(select to_jsonb(m) from public.ministries m where id=mid),'role',member_role,'plan_id',private.my_rank(),'ministry_plan_id',rank,'suspended',rank>0 and not private.seat_allowed(mid,uid) and not private.is_admin(),'seats',coalesce(capacity,0),'is_admin',private.is_admin(),'invites',case when member_role='owner' then coalesce((select jsonb_agg(x) from (select id,email,expires_at,created_at from private.invites where ministry_id=mid and accepted_at is null and cancelled_at is null and expires_at>now())x),'[]') else '[]'::jsonb end,'members',coalesce((select jsonb_agg(jsonb_build_object('id',m.user_id,'role',m.role,'active',private.seat_allowed(mid,m.user_id),'display_name',p.display_name,'created_at',m.created_at)) from public.memberships m join public.profiles p on p.id=m.user_id where m.ministry_id=mid),'[]'));
end $$;
