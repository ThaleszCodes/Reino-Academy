create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create table public.plans (id int primary key check(id between 1 and 3), name text not null, price int not null, seats int not null, checkout_url text);
insert into public.plans values (1,'Essencial',27,1,null),(2,'Completo',77,3,null),(3,'Avançado',127,20,null);
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null default '', created_at timestamptz not null default now());
create table public.ministries (id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 100), city text not null default '', owner_id uuid not null references auth.users(id), created_at timestamptz not null default now());
create table public.memberships (user_id uuid primary key references auth.users(id) on delete cascade, ministry_id uuid not null references public.ministries(id) on delete cascade, role text not null check(role in ('owner','member')), created_at timestamptz not null default now());
create index memberships_ministry on public.memberships(ministry_id);
create table private.admin_emails (email text primary key);
insert into private.admin_emails values ('kalebyalvesgamer@gmail.com');
create table private.purchases (order_id text primary key, email text not null, offer_id text not null, plan_id int not null references public.plans(id), status text not null check(status in ('paid','refunded','chargeback')), ministry_id uuid references public.ministries(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index purchases_email on private.purchases(lower(email));
create index purchases_ministry on private.purchases(ministry_id);
create table private.offers (offer_id text primary key, product_id text not null, plan_id int not null references public.plans(id));
create table private.invites (id uuid primary key default gen_random_uuid(), ministry_id uuid not null references public.ministries(id) on delete cascade, email text not null, token_hash text unique not null, expires_at timestamptz not null default now()+interval '7 days', accepted_at timestamptz, cancelled_at timestamptz, created_at timestamptz not null default now());
create index invites_ministry on private.invites(ministry_id);
create table private.webhook_events (event_key text primary key, order_id text not null, event text not null, received_at timestamptz not null default now());
create table private.audit (id bigint generated always as identity primary key, actor uuid, action text not null, details jsonb not null default '{}', created_at timestamptz not null default now());
create table public.courses (id text primary key, title text not null, description text not null, cover text not null, min_plan int not null references public.plans(id), sort_order int not null default 0);
create table public.modules (id text primary key, course_id text not null references public.courses(id), title text not null, sort_order int not null default 0);
create table public.lessons (id text primary key, module_id text not null references public.modules(id), title text not null, drive_id text not null, kind text not null default 'video' check(kind in ('video','attachment')), sort_order int not null default 0);
create index lessons_module on public.lessons(module_id);
create index modules_course on public.modules(course_id);
create table public.resources (id text primary key, title text not null, description text not null, category text not null, format text not null, cover text not null, min_plan int not null references public.plans(id), instructions text not null default '', sort_order int not null default 0);
create table public.resource_links (id uuid primary key default gen_random_uuid(), resource_id text not null references public.resources(id), label text not null, url text not null check(url ~ '^https://'), sort_order int not null default 0);
create index resource_links_resource on public.resource_links(resource_id);
create table public.progress (user_id uuid not null references auth.users(id) on delete cascade, lesson_id text not null references public.lessons(id), completed_at timestamptz not null default now(), primary key(user_id,lesson_id));
create table public.settings (id bool primary key default true check(id), support_email text not null default '', welcome text not null default 'Aprenda, crie e organize a mídia da sua igreja.');
insert into public.settings(id) values(true);

create function private.is_admin() returns bool language sql stable security definer set search_path='' as $$ select exists(select 1 from auth.users u join private.admin_emails a on lower(u.email)=a.email where u.id=auth.uid() and u.email_confirmed_at is not null) $$;
create function private.my_ministry() returns uuid language sql stable security definer set search_path='' as $$ select ministry_id from public.memberships where user_id=auth.uid() $$;
create function private.rank_for(mid uuid) returns int language sql stable security definer set search_path='' as $$ select case when private.is_admin() then 3 else coalesce((select max(plan_id) from private.purchases where ministry_id=mid and status='paid'),0) end $$;
create function private.my_rank() returns int language sql stable security definer set search_path='' as $$ select case when auth.uid() is null then 0 else private.rank_for(private.my_ministry()) end $$;
revoke all on function private.is_admin(), private.my_ministry(), private.rank_for(uuid),private.my_rank() from public;
grant execute on function private.is_admin(), private.my_ministry(),private.my_rank() to authenticated;

alter table public.plans enable row level security;
create policy plan_read on public.plans for select to anon, authenticated using(true);
alter table public.settings enable row level security;
create policy settings_read on public.settings for select to authenticated using(true);
alter table public.profiles enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()) or id in (select user_id from public.memberships where ministry_id=(select private.my_ministry())));
create policy profile_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
alter table public.ministries enable row level security;
create policy ministry_read on public.ministries for select to authenticated using(id=(select private.my_ministry()));
alter table public.memberships enable row level security;
create policy membership_read on public.memberships for select to authenticated using(ministry_id=(select private.my_ministry()));
alter table public.courses enable row level security;
create policy course_read on public.courses for select to authenticated using(true);
alter table public.modules enable row level security;
create policy module_read on public.modules for select to authenticated using(exists(select 1 from public.courses c where c.id=course_id and c.min_plan<=(select private.my_rank())));
alter table public.lessons enable row level security;
create policy lesson_read on public.lessons for select to authenticated using(exists(select 1 from public.modules m join public.courses c on c.id=m.course_id where m.id=module_id and c.min_plan<=(select private.my_rank())));
alter table public.resources enable row level security;
create policy resource_read on public.resources for select to authenticated using(true);
alter table public.resource_links enable row level security;
create policy link_read on public.resource_links for select to authenticated using(exists(select 1 from public.resources r where r.id=resource_id and r.min_plan<=(select private.my_rank())));
alter table public.progress enable row level security;
create policy progress_read on public.progress for select to authenticated using(user_id=(select auth.uid()));
create policy progress_insert on public.progress for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.lessons where id=lesson_id));
create policy progress_delete on public.progress for delete to authenticated using(user_id=(select auth.uid()));
grant select on public.plans to anon,authenticated;
grant select on public.settings,public.profiles,public.ministries,public.memberships,public.courses,public.modules,public.lessons,public.resources,public.resource_links,public.progress to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert,delete on public.progress to authenticated;

-- All mutations involving membership/entitlements are atomic and authorized here.
create function private.action(op text, args jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
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
 return jsonb_build_object('profile',(select to_jsonb(p) from public.profiles p where id=uid),'ministry',(select to_jsonb(m) from public.ministries m where id=mid),'role',member_role,'plan_id',rank,'seats',coalesce(capacity,0),'is_admin',private.is_admin(),'invites',case when member_role='owner' then coalesce((select jsonb_agg(x) from (select id,email,expires_at,created_at from private.invites where ministry_id=mid and accepted_at is null and cancelled_at is null and expires_at>now())x),'[]') else '[]'::jsonb end,'members',coalesce((select jsonb_agg(jsonb_build_object('id',m.user_id,'role',m.role,'display_name',p.display_name,'created_at',m.created_at)) from public.memberships m join public.profiles p on p.id=m.user_id where m.ministry_id=mid),'[]'));
end $$;
revoke all on function private.action(text,jsonb) from public;
grant execute on function private.action(text,jsonb) to authenticated;
create function public.ra_action(op text,args jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select private.action(op,args) $$;
revoke all on function public.ra_action(text,jsonb) from public,anon;
grant execute on function public.ra_action(text,jsonb) to authenticated;

create function private.record_cakto(event_name text,order_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare key text; oid text; offer text; pid text; email text; plan int; state text; mid uuid;
begin
 oid:=order_data->>'id';offer:=order_data#>>'{offer,id}';pid:=order_data#>>'{product,id}';email:=lower(order_data#>>'{customer,email}');
 if coalesce(oid,'')='' then raise exception 'Missing order ID'; end if;
 if event_name not in ('purchase_approved','refund','chargeback') then return '{"ignored":true}'::jsonb; end if;
 select plan_id into plan from private.offers where offer_id=offer and product_id=pid;
 if plan is null then raise exception 'Unknown Cakto offer/product'; end if;
 if email is null or email !~ '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Missing customer email'; end if;
 if event_name='purchase_approved' and order_data->>'status' is distinct from 'paid' then raise exception 'Payment is not paid'; end if;
 key:=oid||':'||event_name;
 insert into private.webhook_events values(key,oid,event_name,now()) on conflict do nothing;
 if not found then return '{"duplicate":true}'::jsonb; end if;
 state:=case event_name when 'purchase_approved' then 'paid' when 'refund' then 'refunded' else 'chargeback' end;
 select m.id into mid from public.ministries m join auth.users u on u.id=m.owner_id where lower(u.email)=email and u.email_confirmed_at is not null;
 insert into private.purchases(order_id,email,offer_id,plan_id,status,ministry_id) values(oid,email,offer,plan,state,mid) on conflict(order_id) do update set status=case when private.purchases.status in ('refunded','chargeback') then private.purchases.status else excluded.status end,updated_at=now();
 insert into private.audit(action,details) values('cakto_'||event_name,jsonb_build_object('order_id',oid));
 return '{"ok":true}'::jsonb;
end $$;
revoke all on function private.record_cakto(text,jsonb) from public;
grant execute on function private.record_cakto(text,jsonb) to service_role;
create function public.record_cakto(event_name text,order_data jsonb) returns jsonb language sql security invoker set search_path='' as $$ select private.record_cakto(event_name,order_data) $$;
revoke all on function public.record_cakto(text,jsonb) from public,anon,authenticated;
grant execute on function public.record_cakto(text,jsonb) to service_role;

-- Defense in depth for non-exposed tables.
alter table private.purchases enable row level security;
alter table private.offers enable row level security;
alter table private.invites enable row level security;
alter table private.webhook_events enable row level security;
alter table private.admin_emails enable row level security;
alter table private.audit enable row level security;
