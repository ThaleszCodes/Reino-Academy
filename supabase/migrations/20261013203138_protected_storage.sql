alter table public.resource_links add column storage_path text;
insert into storage.buckets(id,name,public,file_size_limit) values('reino-materials','reino-materials',false,52428800);
create policy material_download on storage.objects for select to authenticated using(bucket_id='reino-materials' and exists(select 1 from public.resources r where r.id=(storage.foldername(name))[1] and r.min_plan<=(select private.my_rank())));
create policy admin_upload on storage.objects for insert to authenticated with check(bucket_id='reino-materials' and (select private.is_admin()));
create policy admin_replace on storage.objects for update to authenticated using(bucket_id='reino-materials' and (select private.is_admin())) with check(bucket_id='reino-materials' and (select private.is_admin()));
create policy admin_remove_file on storage.objects for delete to authenticated using(bucket_id='reino-materials' and (select private.is_admin()));
