import {NextResponse} from 'next/server';
import {requireWorkspace,uuid} from '@/lib/dms';
import {config,sb} from '@/lib/cms';
import {jsonGuard} from '../../admin/_security';

const error=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
const ok=(body:unknown)=>NextResponse.json(body,{headers:{'Cache-Control':'no-store'}});
const text=(value:unknown,max:number)=>typeof value==='string'&&value.trim().length>0&&value.length<=max;
const strong=(value:unknown)=>typeof value==='string'&&value.length>=12&&value.length<=128&&/[a-z]/.test(value)&&/[A-Z]/.test(value)&&/[0-9]/.test(value);
const roleOk=(value:unknown)=>['member','reviewer','admin'].includes(String(value));

async function adminAuth(path:string,init:RequestInit={}){
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!service)throw new Error('STAFF_CONFIGURATION');
 const {url}=config();
 return fetch(url+'/auth/v1/admin'+path,{...init,headers:{apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json',...init.headers},cache:'no-store'});
}

export async function POST(req:Request){
 const guard=jsonGuard(req);if(guard)return guard;
 try{
  const a=await requireWorkspace();
  if(!a)return error('Workspace access required.',401);
  const b:any=await req.json();
  if(a.member.role!=='admin')return error('Workspace administrator access required.',403);
  if(b.action==='create'){
   if(!text(b.name,160)||!text(b.email,254)||!/^\S+@\S+\.\S+$/.test(b.email.trim())||!roleOk(b.role)||!strong(b.password))return error('Enter a name, valid email, role and password with at least 12 characters including upper and lower case and a number.');
   const created=await adminAuth('/users',{method:'POST',body:JSON.stringify({email:b.email.trim().toLowerCase(),password:b.password,email_confirm:true,user_metadata:{full_name:b.name.trim()}})});
   if(!created.ok){if(created.status===422||created.status===400)return error('Could not create this account. If the email already has an account, use Link existing account.',409);return error('Account creation failed. Check server configuration and try again.',502)}
   const user:any=await created.json();
   if(!uuid(user.id))return error('Account creation returned an unexpected response. Check Supabase Authentication before retrying.',502);
   const member=await sb('/rest/v1/dms_members',a.token,{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({user_id:user.id,display_name:b.name.trim(),role:b.role,active:true})});
   if(!member.ok){
    const undo=await adminAuth('/users/'+user.id,{method:'DELETE'}).catch(()=>null);
    if(!undo?.ok)return error('Account was created but workspace access failed. Ask the Supabase administrator to review Auth user ID '+user.id+' before retrying.',502);
    return error('Workspace access could not be granted. The new account was removed. Check migration 005.',502);
   }
   const [record]=await member.json();
   return ok({member:record,message:'Account created. Share the temporary password securely; it will not be shown again.'});
  }
  if(b.action==='link'){
   if(!uuid(b.user_id)||!text(b.name,160)||!text(b.email,254)||!roleOk(b.role))return error('Enter the account UUID, email, name and role.');
   const found=await adminAuth('/users/'+b.user_id);
   if(!found.ok)return error('Account could not be verified. Check the UUID and email.',404);
   const user:any=await found.json();
   if(String(user.email||'').toLowerCase()!==b.email.trim().toLowerCase())return error('Email does not match that Auth account.',400);
   const r=await sb('/rest/v1/dms_members',a.token,{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({user_id:b.user_id,display_name:b.name.trim(),role:b.role,active:true})});
   if(!r.ok){if(r.status===409)return error('That account already has workspace membership. Update it in the team list.',409);return error('Could not link staff access. Check migration 005.',502)}
   const [member]=await r.json();return ok({member,message:'Existing account linked. Its current password was not changed.'});
  }
  if(b.action==='update'){
   if(!uuid(b.user_id)||!roleOk(b.role)||typeof b.active!=='boolean')return error('Invalid staff access update.');
   const r=await sb('/rest/v1/dms_members?user_id=eq.'+b.user_id,a.token,{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({role:b.role,active:b.active})});
   const result:any=await r.json();if(!r.ok)return error(result.message||'Unable to update staff access.',r.status);if(!result.length)return error('Staff record not found.',404);return ok({member:result[0],message:'Staff access updated.'});
  }
  if(b.action==='reset_password'){
   if(!uuid(b.user_id)||!strong(b.password))return error('Enter a valid user and a password of at least 12 characters, including upper and lower case and a number.');
   const check=await sb('/rest/v1/dms_members?select=user_id&user_id=eq.'+b.user_id,a.token);
   if(!check.ok||!(await check.json()).length)return error('Staff record not found.',404);
   const audit=await sb('/rest/v1/rpc/dms_log_staff_reset',a.token,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject:b.user_id})});
   if(!audit.ok)return error('Unable to record the reset request. Check migration 005.',502);
   const r=await adminAuth('/users/'+b.user_id,{method:'PUT',body:JSON.stringify({password:b.password})});
   if(!r.ok)return error('Password reset failed. Check server settings and try again.',502);
   return ok({message:'Password reset. Share the new temporary password securely.'});
  }
  return error('Unknown staff action.');
 }catch(e){if((e as Error).message==='STAFF_CONFIGURATION')return error('Staff account creation requires the server-only SUPABASE_SERVICE_ROLE_KEY.',503);return error('Unable to complete the staff request.',500)}
}
