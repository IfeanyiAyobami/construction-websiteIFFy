
import { NextResponse } from 'next/server';

/**
 * Validate browser-originated mutations.
 * Supports reverse-proxy deployments such as Netlify.
 */
export function mutationGuard(req: Request): NextResponse | null {
  const origin = req.headers.get('origin');

  if (origin) {
    let requestOrigin: URL;

    try {
      requestOrigin = new URL(origin);
    } catch {
      return NextResponse.json(
        { error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const forwardedHost = req.headers.get('x-forwarded-host');
    const requestHost = req.headers.get('host');

    const allowedHosts = [
      forwardedHost,
      requestHost,
      new URL(req.url).host,
    ].filter((host): host is string => Boolean(host));

    if (!allowedHosts.includes(requestOrigin.host)) {
      return NextResponse.json(
        { error: 'Cross-origin request rejected' },
        { status: 403 }
      );
    }

    if (
      requestOrigin.protocol !== 'https:' &&
      requestOrigin.hostname !== 'localhost' &&
      requestOrigin.hostname !== '127.0.0.1'
    ) {
      return NextResponse.json(
        { error: 'Insecure request origin rejected' },
        { status: 403 }
      );
    }
  }

  const site = req.headers.get('sec-fetch-site');

  if (site && !['same-origin', 'none'].includes(site)) {
    return NextResponse.json(
      { error: 'Cross-site request rejected' },
      { status: 403 }
    );
  }

  const length = Number(req.headers.get('content-length') || 0);

  if (length > 9 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Request too large' },
      { status: 413 }
    );
  }

  return null;
}

export function jsonGuard(req: Request): NextResponse | null {
  const guard = mutationGuard(req);

  if (guard) return guard;

  if (
    !req.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  ) {
    return NextResponse.json(
      { error: 'Expected JSON' },
      { status: 415 }
    );
  }

  if (Number(req.headers.get('content-length') || 0) > 128 * 1024) {
    return NextResponse.json(
      { error: 'JSON too large' },
      { status: 413 }
    );
  }

  return null;
}
