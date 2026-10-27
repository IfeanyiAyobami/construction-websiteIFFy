import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {requireWorkspace} from '@/lib/dms';

export const runtime = 'nodejs';
const files: Record<string,string> = {terrace:'NICE_TERRACE_IFFYnity_Structures_IO.pdf', residence:'4_BEDROOM_IFFYnity_Structures_IO.pdf'};
export async function GET(request: Request) {
  const session = await requireWorkspace();
  if (!session || session.member.role !== 'admin') return NextResponse.json({error:'Workspace administrator required.'},{status:403});
  const name = files[new URL(request.url).searchParams.get('drawing') || ''];
  if (!name) return NextResponse.json({error:'Example not found.'},{status:404});
  try {
    const bytes = await readFile(path.join(process.cwd(),'private-documents',name));
    return new NextResponse(new Uint8Array(bytes), {headers:{'Content-Type':'application/pdf','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  } catch { return NextResponse.json({error:'Example drawing is unavailable on this server. Check that the private documents are included in deployment.'},{status:503}); }
}
