import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { parseCaktoEvent, constantTimeEqual } from './payload.ts';
Deno.serve(async (req:Request)=>{
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 const secret=Deno.env.get('CAKTO_WEBHOOK_SECRET');
 if(!secret)return new Response('Integration not configured',{status:503});
 try{
 if(Number(req.headers.get('content-length')||0)>65536)return new Response('Payload too large',{status:413});
 const raw=await req.text();if(raw.length>65536)return new Response('Payload too large',{status:413});
 const body=JSON.parse(raw);
 if(typeof body.secret!=='string'||!constantTimeEqual(body.secret,secret))return new Response('Unauthorized',{status:401});
 const parsed=parseCaktoEvent(body);
 if(parsed.ignored)return Response.json({ignored:true});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
 const {data,error}=await db.rpc('record_cakto',{event_name:parsed.event,order_data:parsed.data});
 if(error){console.error('Cakto processing error',error.code);return Response.json({error:'Could not process event'},{status:422});}
 return Response.json(data);
 }catch{return Response.json({error:'Invalid payload'},{status:400})}
});
