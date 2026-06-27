import { NextResponse } from 'next/server';
import { COOKIE, verifySession } from './lib/session';

export async function middleware(req) {
  const token = req.cookies.get(COOKIE)?.value;
  const session = await verifySession(token);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/dashboard/:path*'] };
