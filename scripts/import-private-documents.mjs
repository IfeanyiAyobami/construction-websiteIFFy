import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,''),key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email=process.env.DMS_IMPORT_EMAIL,password=process.env.DMS_IMPORT_PASSWORD;
if(!url?.startsWith('https://')||!key||!email||!password)throw Error('Set the HTTPS Supabase URL/key and DMS_IMPORT_EMAIL / DMS_IMPORT_PASSWORD in .env.local.');
async function request(path,token,init={}){
 const response=await fetch(url+path,{...init,headers:{apikey:key,Authorization:'Bearer '+(token||key),...init.headers}});
 const text=await response.text();let data;try{data=JSON.parse(text)}catch{data={message:'Unexpected server response'}}
 if(!response.ok){const e=new Error(data.message||data.msg||data.error_description||data.error||'Supabase request failed');e.status=response.status;throw e}return data;
}
let auth;
try{
 auth=await request('/auth/v1/token?grant_type=password',null,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const token=auth.access_token,user=auth.user.id;
 const [member]=await request('/rest/v1/dms_members?select=role&user_id=eq.'+user,token);
 if(!member)throw Error('Import account needs dms_members workspace membership.');
 const reviewer=process.env.DMS_IMPORT_REVIEWER_UUID||null;
 if(reviewer){if(!/^[0-9a-f-]{36}$/i.test(reviewer)||reviewer===user)throw Error('Reviewer must be a different staff UUID.');const [staff]=await request('/rest/v1/dms_members?select=role&user_id=eq.'+reviewer,token);if(!staff||!['reviewer','admin'].includes(staff.role))throw Error('Reviewer needs reviewer/admin membership.')}
 const files=[{name:'NICE_TERRACE_IFFYnity_Structures_IO.pdf',title:'Nice Terrace - Structural working drawings',project:'Nice Terrace'},{name:'4_BEDROOM_IFFYnity_Structures_IO.pdf',title:'4 Bedroom Residence - Structural working drawings',project:'4 Bedroom Residence'}];
 for(const item of files){
  const bytes=await readFile(new URL('../private-documents/'+item.name,import.meta.url));
  if(bytes.length>52428800||!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('Invalid or oversized PDF: '+item.name);
  const digest=createHash('sha256').update(bytes).digest('hex');
  const root=digest.slice(0,8)+'-'+digest.slice(8,12)+'-4'+digest.slice(13,16)+'-a'+digest.slice(17,20)+'-'+digest.slice(20,32);
  const [existing]=await request('/rest/v1/dms_documents?select=id,file_name,size_bytes&root_id=eq.'+root+'&limit=1',token);
  if(existing){if(existing.file_name!==item.name||Number(existing.size_bytes)!==bytes.length)throw Error('Existing identity differs; inspect before importing.');console.log('Already imported: '+item.name);continue}
  const path=user+'/imports/'+digest+'-'+item.name;
  try{await request('/storage/v1/object/konsadem-documents/'+path,token,{method:'POST',headers:{'Content-Type':'application/pdf','x-upsert':'false'},body:bytes})}catch(e){if(e.status!==409&&!/already exists|duplicate/i.test(e.message))throw e}
  await request('/rest/v1/dms_documents',token,{method:'POST',headers:{'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({root_id:root,revision:1,title:item.title,project:item.project,category:'Structural drawings',file_path:path,file_name:item.name,mime_type:'application/pdf',size_bytes:bytes.length,uploaded_by:user,reviewer_id:reviewer})});
  console.log('Imported privately as draft: '+item.name);
 }
 console.log('Import complete. Open /workspace to submit each draft for review.');
}finally{if(auth?.access_token)await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+auth.access_token}}).catch(()=>{});}
