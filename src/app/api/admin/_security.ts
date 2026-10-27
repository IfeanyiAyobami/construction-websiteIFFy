/** Basic same-origin protection for cookie-authenticated mutation endpoints. */
import { NextResponse } from 'next/server';
export function mutationGuard(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');
  const target = new URL(req.url).origin;
  const allowed = new Set([target, process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.SITE_URL].filter(Boolean));
  if (origin && !allowed.has(origin)) return NextResponse.json({error:'Cross-origin request rejected'}, {status:403});
  const site = req.headers.get('sec-fetch-site');
  if (site && !['same-origin','none'].includes(site)) return NextResponse.json({error:'Cross-site request rejected'}, {status:403});
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 9 * 1024 * 1024) return NextResponse.json({error:'Request too large'}, {status:413});
  return null;
}
export function jsonGuard(req:Request):NextResponse|null {
  const g=mutationGuard(req);if(g)return g;
  if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return NextResponse.json({error:'Expected JSON'}, {status:415});
  if(Number(req.headers.get('content-length')||0)>128*1024)return NextResponse.json({error:'JSON too large'}, {status:413});
  return null;
}
