export const TABLES = ['projects','posts','team_members','services','testimonials'] as const;
export type CmsTable = typeof TABLES[number];
export const isTable = (x:string):x is CmsTable => TABLES.includes(x as CmsTable);
export const columns:Record<CmsTable,string[]> = {
 projects:['title','slug','summary','body','category','location','image_url','gallery','completed_at','featured','status','sort_order'],
 posts:['title','slug','summary','body','category','image_url','featured','status','published_at'],
 team_members:['name','slug','role','bio','image_url','email','sort_order','status'],
 services:['title','slug','summary','body','image_url','sort_order','status'],
 testimonials:['name','role','quote','image_url','sort_order','status']
};
export type CmsRecord = {id:string;status:string;created_at:string;updated_at:string;[key:string]:unknown};
export function config(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'');const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw Error('CMS environment is not configured');return {url,key};}
type JsonResponse=Omit<Response,'json'>&{json():Promise<any>};
export async function sb(path:string,token?:string,init:RequestInit={}){const {url,key}=config();return fetch(`${url}${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${token||key}`,...init.headers},cache:'no-store'}) as Promise<JsonResponse>;}
export function cleanRecord(table:CmsTable,body:unknown){if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Invalid payload');const data=body as Record<string,unknown>;const out:Record<string,unknown>={};for(const k of columns[table])if(k in data){const v=data[k];if(k==='gallery'){if(!Array.isArray(v)||v.length>30||v.some(x=>typeof x!=='string'||x.length>2048||!/^https:\/\//i.test(x)))throw Error('Invalid gallery');out[k]=v;continue;}if(['featured'].includes(k)){if(typeof v!=='boolean')throw Error(`Invalid ${k}`);out[k]=v;continue;}if(k==='sort_order'){if(typeof v!=='number'||!Number.isInteger(v))throw Error('Invalid order');out[k]=v;continue;}if(v!==null&&typeof v!=='string')throw Error(`Invalid ${k}`);if(typeof v==='string'&&v.length>(k==='body'?25000:2048))throw Error(`Too long: ${k}`);if(typeof v==='string'&&['image_url'].includes(k)&&v!==''&&!/^https:\/\//i.test(v))throw Error('Invalid image URL');out[k]=v;}
if('status' in out&&!['draft','published','archived'].includes(String(out.status)))throw Error('Invalid status');if('slug' in out&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(out.slug)))throw Error('Invalid slug');return out;}
