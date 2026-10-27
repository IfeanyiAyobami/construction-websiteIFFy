import {getSession} from './auth';
import {sb} from './cms';
export async function requireWorkspace(){const s=await getSession();if(!s)return null;const r=await sb('/rest/v1/dms_members?select=*&user_id=eq.'+s.user.id,s.token);if(!r.ok)return null;const rows=await r.json();return rows.length&&rows[0].active!==false?{...s,member:rows[0]}:null;}
export const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
