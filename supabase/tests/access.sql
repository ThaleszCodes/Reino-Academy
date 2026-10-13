begin;
-- Disposable fixtures: always rolled back, including users, purchases and invites.
insert into auth.users(id,email,email_confirmed_at,aud,role) values
('00000000-0000-4000-a000-000000000001','ra-test-a@example.invalid',now(),'authenticated','authenticated'),
('00000000-0000-4000-a000-000000000002','ra-test-b@example.invalid',now(),'authenticated','authenticated'),
('00000000-0000-4000-a000-000000000003','ra-test-member@example.invalid',now(),'authenticated','authenticated'),
('00000000-0000-4000-a000-000000000004','ra-test-other@example.invalid',now(),'authenticated','authenticated');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000001',true);
select public.ra_action('onboard','{"name":"Teste A","display_name":"Teste A"}');
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000002',true);
select public.ra_action('onboard','{"name":"Teste B","display_name":"Teste B"}');
reset role;
insert into private.purchases(order_id,email,offer_id,plan_id,status,ministry_id) select 'test-order-a','ra-test-a@example.invalid','test-offer',2,'paid',id from public.ministries where owner_id='00000000-0000-4000-a000-000000000001';
insert into private.purchases(order_id,email,offer_id,plan_id,status,ministry_id) select 'test-order-b','ra-test-b@example.invalid','test-offer',1,'paid',id from public.ministries where owner_id='00000000-0000-4000-a000-000000000002';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000001',true);
do $$declare tok text;begin
 if (select count(*) from public.ministries)<>1 then raise exception 'Tenant isolation failed';end if;
 if exists(select 1 from public.resource_links l join public.resources r on r.id=l.resource_id where r.min_plan=3) then raise exception 'Locked resource leak';end if;
 if private.my_rank()<>2 then raise exception 'Rank failed';end if;
 tok:=public.ra_action('invite','{"email":"ra-test-member@example.invalid"}')->>'token';
 perform set_config('ra.test_token',tok,true);
 perform public.ra_action('invite','{"email":"ra-test-other@example.invalid"}');
 begin perform public.ra_action('invite','{"email":"overflow@example.invalid"}');raise exception 'Seat limit bypass';exception when raise_exception then if SQLERRM='Seat limit bypass' then raise;end if;end;
 begin perform public.ra_action('admin');raise exception 'Admin bypass';exception when raise_exception then if SQLERRM='Admin bypass' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000003',true);
select public.ra_action('accept_invite',jsonb_build_object('token',current_setting('ra.test_token'),'display_name','Integrante'));
do $$begin
 if (select count(*) from public.memberships)<>2 then raise exception 'Membership visibility failed';end if;
 begin perform public.ra_action('remove_member','{"id":"00000000-0000-4000-a000-000000000001"}');raise exception 'Member privilege bypass';exception when raise_exception then if SQLERRM='Member privilege bypass' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000002',true);
do $$begin
 if exists(select 1 from public.lessons l join public.modules m on l.module_id=m.id where m.course_id='capcut') then raise exception 'Course leak';end if;
 begin perform public.ra_action('invite','{"email":"new@example.invalid"}');raise exception 'Essential seat bypass';exception when raise_exception then if SQLERRM='Essential seat bypass' then raise;end if;end;
end $$;
reset role;
update private.purchases set status='refunded' where order_id='test-order-a';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000003',true);
do $$begin if exists(select 1 from public.resource_links) or exists(select 1 from public.lessons) then raise exception 'Refund did not revoke content';end if;end $$;
reset role;
insert into private.offers values('test-offer','test-product',1);
select public.record_cakto('refund','{"id":"test-reordered","customer":{"email":"ra-test-b@example.invalid"},"offer":{"id":"test-offer"},"product":{"id":"test-product"}}');
select public.record_cakto('purchase_approved','{"id":"test-reordered","status":"paid","customer":{"email":"ra-test-b@example.invalid"},"offer":{"id":"test-offer"},"product":{"id":"test-product"}}');
do $$begin if (select status from private.purchases where order_id='test-reordered')<>'refunded' then raise exception 'Out-of-order approval resurrected refund';end if;end $$;
-- Admin-only file registration is independently guarded, including public RPC calls.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000002',true);
do $$begin
 begin perform public.ra_register_file('material-01','Test','material-01/test.pdf');raise exception 'Upload registration bypass';exception when raise_exception then if SQLERRM='Upload registration bypass' then raise;end if;end;
 if exists(select 1 from storage.objects o join public.resources r on r.id=split_part(o.name,'/',1) where o.bucket_id='reino-materials' and r.min_plan>1) then raise exception 'Private storage leak';end if;
end $$;
reset role;
insert into auth.users(id,email,email_confirmed_at,aud,role) values('00000000-0000-4000-a000-000000000005','ra-test-admin@example.invalid',now(),'authenticated','authenticated');
insert into private.admin_emails values('ra-test-admin@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-a000-000000000005',true);
select public.ra_register_file('material-01','Test file registration',(select storage_path from public.resource_links where resource_id='material-01' and storage_path is not null limit 1));
reset role;
select 'PASS: tenant isolation, plan access, invitation capacity, member roles, revocation, reordered webhook' as result;
rollback;
