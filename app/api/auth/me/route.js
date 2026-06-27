import { cookies } from 'next/headers';
import { COOKIE, verifySession } from '@/lib/session';
export const runtime = 'nodejs';
export async function GET() {
  const s = await verifySession(cookies().get(COOKIE)?.value);
  if (!s) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: { email: s.email, name: s.name } });
}
