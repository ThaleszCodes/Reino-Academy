create or replace function public.ra_register_file(resource_id text,label text,storage_path text) returns uuid language plpgsql security definer set search_path='' as $$
declare new_id uuid;
begin
 if auth.uid() is null or not private.is_admin() then raise exception 'Sem permissão.'; end if;
 if length(trim(label)) not between 1 and 200 then raise exception 'Informe o nome do arquivo.'; end if;
 if not exists(select 1 from public.resources r where r.id=resource_id) or split_part(storage_path,'/',1)<>resource_id or storage_path like '%..%' then raise exception 'Caminho inválido.'; end if;
 if not exists(select 1 from storage.objects o where o.bucket_id='reino-materials' and o.name=storage_path) then raise exception 'Arquivo ainda não enviado.'; end if;
 insert into public.resource_links(resource_id,label,url,storage_path) values(resource_id,trim(label),'https://iibxznwicmxrsogurith.supabase.co/storage/v1/object/reino-materials/'||storage_path,storage_path) returning id into new_id;
 return new_id;
end $$;
revoke all on function public.ra_register_file(text,text,text) from public,anon;
grant execute on function public.ra_register_file(text,text,text) to authenticated;
