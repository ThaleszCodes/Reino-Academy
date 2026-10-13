create or replace function private.record_cakto(event_name text,order_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare key text; oid text; offer text; pid text; p_email text; plan int; state text; mid uuid;
begin
 oid:=order_data->>'id';offer:=order_data#>>'{offer,id}';pid:=order_data#>>'{product,id}';p_email:=lower(order_data#>>'{customer,email}');
 if coalesce(oid,'')='' then raise exception 'Missing order ID'; end if;
 if event_name not in ('purchase_approved','refund','chargeback') then return '{"ignored":true}'::jsonb; end if;
 select plan_id into plan from private.offers where offer_id=offer and product_id=pid;
 if plan is null then raise exception 'Unknown Cakto offer/product'; end if;
 if p_email is null or p_email !~ '^[^ @]+@[^ @]+\.[^ @]+$' then raise exception 'Missing customer email'; end if;
 if event_name='purchase_approved' and order_data->>'status' is distinct from 'paid' then raise exception 'Payment is not paid'; end if;
 key:=oid||':'||event_name;
 insert into private.webhook_events values(key,oid,event_name,now()) on conflict do nothing;
 if not found then return '{"duplicate":true}'::jsonb; end if;
 state:=case event_name when 'purchase_approved' then 'paid' when 'refund' then 'refunded' else 'chargeback' end;
 select m.id into mid from public.ministries m join auth.users u on u.id=m.owner_id where lower(u.email)=p_email and u.email_confirmed_at is not null;
 insert into private.purchases(order_id,email,offer_id,plan_id,status,ministry_id) values(oid,p_email,offer,plan,state,mid) on conflict(order_id) do update set status=case when private.purchases.status in ('refunded','chargeback') then private.purchases.status else excluded.status end,updated_at=now();
 insert into private.audit(action,details) values('cakto_'||event_name,jsonb_build_object('order_id',oid));
 return '{"ok":true}'::jsonb;
end $$;
