import { cookies } from 'next/headers';
import { COOKIE, cookieOpts } from '@/lib/session';
export const runtime = 'nodejs';
export async function POST() {
  cookies().set(COOKIE, '', { ...cookieOpts, maxAge: 0 });
  return Response.json({ ok: true });
}
