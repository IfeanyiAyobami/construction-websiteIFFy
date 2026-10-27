import assert from 'node:assert/strict';
const actor='11111111-1111-4111-8111-111111111111';
const saved=new Map();let uploads=0,registrations=0;
process.env.NEXT_PUBLIC_SUPABASE_URL='https://supabase.example.test';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key';
process.env.DMS_IMPORT_EMAIL='uploader@example.test';
process.env.DMS_IMPORT_PASSWORD='test-password';
delete process.env.DMS_IMPORT_REVIEWER_UUID;
globalThis.fetch=async(raw,init={})=>{
 const u=new URL(raw);assert.equal(u.origin,'https://supabase.example.test');
 const result=(data)=>new Response(JSON.stringify(data),{status:200});
 if(u.pathname==='/auth/v1/token')return result({access_token:'test-session',user:{id:actor}});
 if(u.pathname==='/auth/v1/logout')return result({});
 assert.equal(init.headers.Authorization,'Bearer test-session');
 if(u.pathname==='/rest/v1/dms_members')return result([{role:'member'}]);
 if(u.pathname==='/rest/v1/dms_documents'&&init.method!=='POST'){return result(saved.has(u.searchParams.get('root_id'))?[saved.get(u.searchParams.get('root_id'))]:[])}
 if(u.pathname.startsWith('/storage/v1/object/')){
  assert.ok(u.pathname.startsWith('/storage/v1/object/konsadem-documents/'+actor+'/imports/'));
  assert.equal(init.headers['x-upsert'],'false');assert.equal(init.headers['Content-Type'],'application/pdf');
  assert.equal(init.body.subarray(0,5).toString(),'%PDF-');uploads++;return result({});
 }
 if(u.pathname==='/rest/v1/dms_documents'&&init.method==='POST'){
  const d=JSON.parse(init.body);assert.equal(d.uploaded_by,actor);assert.equal(d.revision,1);assert.equal(d.reviewer_id,null);assert.ok(!('status' in d));
  assert.ok(d.file_path.startsWith(actor+'/imports/'));saved.set('eq.'+d.root_id,{id:d.root_id,file_name:d.file_name,size_bytes:d.size_bytes});registrations++;return result([d]);
 }
 throw Error('Unexpected mocked request: '+u.pathname);
};
await import('../scripts/import-private-documents.mjs?run=1');
assert.equal(uploads,2);assert.equal(registrations,2);
await import('../scripts/import-private-documents.mjs?run=2');
assert.equal(uploads,2);assert.equal(registrations,2);
console.log('PASS: original PDFs imported privately as drafts; repeated import creates no duplicates (mocked HTTP).');
