import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import assert from 'node:assert/strict';
const users={
 '11111111-1111-4111-8111-111111111111':{id:'11111111-1111-4111-8111-111111111111',email:'admin@example.test',role:'admin'},
 '22222222-2222-4222-8222-222222222222':{id:'22222222-2222-4222-8222-222222222222',email:'member@example.test',role:'member'},
 '33333333-3333-4333-8333-333333333333':{id:'33333333-3333-4333-8333-333333333333',email:'existing@example.test',role:null}
};
const admin='11111111-1111-4111-8111-111111111111',member='22222222-2222-4222-8222-222222222222',existing='33333333-3333-4333-8333-333333333333';
let index=4,forceInsertFailure=false,deleted=[],authOps=[],resetLogs=0;
const mock=createServer(async(req,res)=>{
 const chunks=[];for await(const c of req)chunks.push(c);
 let body={};try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}')}catch{}
 const u=new URL(req.url,'http://127.0.0.1'),token=(req.headers.authorization||'').replace('Bearer ','');
 const send=(n,d)=>{res.writeHead(n,{'content-type':'application/json'});res.end(JSON.stringify(d))};
 if(u.pathname==='/auth/v1/user')return users[token]?send(200,{id:token,email:users[token].email}):send(401,{});
 if(u.pathname.startsWith('/auth/v1/admin/')){
  if(token!=='server-only-test-key')return send(403,{error:'service key required'});
  if(u.pathname==='/auth/v1/admin/users'&&req.method==='POST'){
   authOps.push({action:'create',email:body.email});
   if(Object.values(users).some(x=>x.email===body.email))return send(422,{message:'email exists'});
   const id=String(index++).repeat(8)+'-4444-4444-8444-'+String(index).repeat(12);
   users[id]={id,email:body.email,role:null};return send(200,{id,email:body.email});
  }
  const id=u.pathname.split('/').at(-1),found=users[id];if(!found)return send(404,{});
  if(req.method==='GET')return send(200,found);
  if(req.method==='PUT'){authOps.push({action:'reset',id});return send(200,found)}
  if(req.method==='DELETE'){deleted.push(id);delete users[id];return send(200,{})}
 }
 if(u.pathname==='/rest/v1/dms_members'){
  if(!users[token])return send(401,{});
  if(req.method==='POST'){
   if(users[token].role!=='admin'||forceInsertFailure)return send(403,{message:'blocked'});
   if(users[body.user_id]?.role)return send(409,{message:'duplicate'});
   users[body.user_id].role=body.role;return send(201,[body]);
  }
  const id=(u.searchParams.get('user_id')||'').replace('eq.',''),x=users[id];
  return send(200,x?.role?[{user_id:id,display_name:'Name',role:x.role,active:true}]:[]);
 }
 if(u.pathname==='/rest/v1/rpc/dms_log_staff_reset'){if(users[token]?.role!=='admin')return send(403,{});resetLogs++;return send(200,null)}
 return send(404,{error:'unhandled '+u.pathname});
});
await new Promise(r=>mock.listen(0,'127.0.0.1',r));
const port=mock.address().port;
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','32147'],{env:{...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:'+port,NEXT_PUBLIC_SUPABASE_ANON_KEY:'anon-test',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key',SITE_URL:'http://127.0.0.1:32147'},stdio:'ignore'});
const post=async(payload,who)=>{const r=await fetch('http://127.0.0.1:32147/api/workspace/staff',{method:'POST',headers:{'Content-Type':'application/json',...(who?{Cookie:'monument_access='+who}:{})},body:JSON.stringify(payload)});return [r.status,await r.json()]};
try{
 let ready=false;for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:32147/api/workspace/session');if(r.ok){ready=true;break}}catch{}await delay(200)}assert.ok(ready,'Next server started');
 const example={action:'create',name:'New Person',email:'new@example.test',role:'member',password:'TemporaryPass123'};
 let [status]=await post(example);assert.equal(status,401);
 [status]=await post(example,member);assert.equal(status,403);assert.equal(authOps.length,0);console.log('PASS: anonymous and ordinary staff cannot manage accounts');
 [status]=await post({...example,password:'weak'},admin);assert.equal(status,400);assert.equal(authOps.length,0);console.log('PASS: weak temporary password rejected before user creation');
 let result;[status,result]=await post(example,admin);assert.equal(status,200);assert.equal(result.member.role,'member');assert.ok(!JSON.stringify(result).includes(example.password));console.log('PASS: administrator creates account and response does not expose password');
 [status]=await post(example,admin);assert.equal(status,409);console.log('PASS: existing email is not overwritten');
 [status]=await post({action:'link',name:'Existing Person',email:'wrong@example.test',role:'reviewer',user_id:existing},admin);assert.equal(status,400);assert.equal(users[existing].role,null);
 [status]=await post({action:'link',name:'Existing Person',email:'existing@example.test',role:'reviewer',user_id:existing},admin);assert.equal(status,200);assert.equal(users[existing].role,'reviewer');console.log('PASS: existing account links only after email verification');
 [status]=await post({action:'reset_password',user_id:member,password:'AnotherStrongPass123'},member);assert.equal(status,403);assert.equal(resetLogs,0);
 [status]=await post({action:'reset_password',user_id:member,password:'AnotherStrongPass123'},admin);assert.equal(status,200);assert.equal(resetLogs,1);console.log('PASS: only an administrator can request an audited password reset');
 forceInsertFailure=true;[status]=await post({...example,email:'cleanup@example.test'},admin);assert.equal(status,502);assert.equal(deleted.length,1);assert.ok(!Object.values(users).some(u=>u.email==='cleanup@example.test'));console.log('PASS: failed membership creation rolls back the newly created Auth account');
}finally{app.kill('SIGTERM');await new Promise(r=>mock.close(r))}
