
import { mutationGuard, jsonGuard } from '../_security';
import { NextResponse } from 'next/server';
import { sb } from '@/lib/cms';
import { requireEditor } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireEditor();

    return NextResponse.json({
      authenticated: !!user,
      email: user?.user?.email || null,
      role: user?.role || null,
    });
  } catch (error) {
    console.error('[CMS SESSION GET]', error);

    return NextResponse.json(
      { authenticated: false, email: null, role: null },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  const guard = jsonGuard(req);
  if (guard) return guard;

  try {
    const body = await req.json();

    if (
      !body ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      !body.email.trim() ||
      !body.password ||
      body.password.length > 512
    ) {
      console.error('[CMS LOGIN] Invalid request payload');

      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const email = body.email.trim();

    console.log('[CMS LOGIN] Attempting Supabase authentication');

    const authResponse = await sb(
      '/auth/v1/token?grant_type=password',
      undefined,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: body.password,
        }),
      }
    );

    if (!authResponse.ok) {
      const authError = await authResponse.text();

      console.error(
        '[CMS LOGIN] Supabase authentication rejected:',
        authResponse.status,
        authError
      );

      return NextResponse.json(
        {
          error:
            'Supabase authentication failed. Check the server terminal.',
        },
        { status: 401 }
      );
    }

    const auth = await authResponse.json();

    if (
      !auth.access_token ||
      !auth.refresh_token ||
      !auth.user?.id
    ) {
      console.error(
        '[CMS LOGIN] Supabase returned an incomplete session'
      );

      return NextResponse.json(
        { error: 'Invalid authentication session.' },
        { status: 502 }
      );
    }

    console.log('[CMS LOGIN] Supabase authentication succeeded');

    const editorResponse = await sb(
      '/rest/v1/cms_editors?select=role&user_id=eq.' +
        encodeURIComponent(auth.user.id),
      auth.access_token
    );

    if (!editorResponse.ok) {
      const editorError = await editorResponse.text();

      console.error(
        '[CMS LOGIN] Editor lookup failed:',
        editorResponse.status,
        editorError
      );

      return NextResponse.json(
        { error: 'Unable to verify CMS permissions.' },
        { status: 502 }
      );
    }

    const editors = await editorResponse.json();

    if (!Array.isArray(editors) || editors.length === 0) {
      console.error(
        '[CMS LOGIN] Authenticated user has no CMS editor role'
      );

      return NextResponse.json(
        { error: 'This account is not authorized as a CMS editor.' },
        { status: 403 }
      );
    }

    const role = editors[0]?.role;

    console.log(
      '[CMS LOGIN] Authentication and editor verification succeeded'
    );

    const response = NextResponse.json({
      ok: true,
      role,
    });

    response.cookies.set('monument_access', auth.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.max(60, auth.expires_in || 3600),
    });

    response.cookies.set('monument_refresh', auth.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/admin',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error(
      '[CMS LOGIN] Unexpected server error:',
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      {
        error: 'CMS login encountered a server error.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const guard = mutationGuard(req);
  if (guard) return guard;

  const response = NextResponse.json({ ok: true });

  response.cookies.delete('monument_access');
  response.cookies.delete('monument_refresh');

  return response;
}
