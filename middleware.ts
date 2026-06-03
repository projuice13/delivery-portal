import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_API = ['/api/auth/login', '/api/auth/logout', '/api/version'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_API.some(p => pathname === p)) {
    return NextResponse.next();
  }

  // Fast first-pass: check cookie exists. Full decode happens in handlers.
  const sessionCookie = req.cookies.get('projuice_session');
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
