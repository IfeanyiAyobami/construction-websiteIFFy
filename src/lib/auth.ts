import {cookies} from 'next/headers';
import {sb} from './cms';
export async function getSession(){const c=await cookies();const token=c.get('monument_access')?.value;if(!token)return null;try{const r=await sb('/auth/v1/user',token);if(!r.ok)return null;const user=await r.json();return {token,user};}catch{return null}}
export async function requireEditor(){const session=await getSession();if(!session)return null;const r=await sb('/rest/v1/cms_editors?select=user_id,role&user_id=eq.'+encodeURIComponent(session.user.id),session.token);if(!r.ok)return null;const rows=await r.json();return rows?.length?{...session,role:rows[0].role as string}:null;}
