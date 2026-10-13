import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
export type Plan = {id:number;name:string;price:number;seats:number;checkout_url:string|null};
export type Resource = {id:string;title:string;description:string;category:string;format:string;cover:string;min_plan:number;instructions:string;sort_order:number};
export type Course = {id:string;title:string;description:string;cover:string;min_plan:number};
export type Lesson = {id:string;module_id:string;title:string;drive_id:string;kind:'video'|'attachment';sort_order:number};
export type Module = {id:string;course_id:string;title:string;sort_order:number};
export type Link = {id:string;resource_id:string;label:string;url:string;sort_order:number;storage_path:string|null};
export type Workspace = {profile:{display_name:string};ministry:{id:string;name:string;city:string}|null;role:'owner'|'member'|null;plan_id:number;ministry_plan_id?:number;suspended?:boolean;seats:number;is_admin:boolean;members:{id:string;display_name:string;role:string;active?:boolean}[];invites:{id:string;email:string;expires_at:string}[]};
export async function action(op:string,args:Record<string,unknown>={}){const {data,error}=await supabase.rpc('ra_action',{op,args});if(error)throw error;return data;}
export function friendlyError(e:unknown){const m=e instanceof Error?e.message:typeof e==='object'&&e&&'message' in e?String(e.message):'Não foi possível concluir. Tente novamente.';if(m.includes('Invalid login'))return 'E-mail ou senha incorretos.';if(m.includes('Email not confirmed'))return 'Confirme seu e-mail antes de entrar.';if(m.includes('rate limit'))return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';if(m.includes('Failed to fetch'))return 'Confira sua conexão e tente novamente.';return m;}
export function drivePreview(id:string){return `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;}
export function safeUrl(url:string){try{const u=new URL(url);return u.protocol==='https:'&&['drive.google.com','docs.google.com','www.canva.com','canva.link','pay.cakto.com.br'].includes(u.hostname)?url:null;}catch{return null;}}
