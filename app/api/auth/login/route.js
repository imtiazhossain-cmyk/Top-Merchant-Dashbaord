import { cookies } from 'next/headers';
import { getUser } from '@/lib/store';
import { checkPassword, normEmail } from '@/lib/auth';
import { createSession, COOKIE, cookieOpts } from '@/lib/session';
export const runtime = 'nodejs';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return Response.json({ error: 'Email and password are required.' }, { status: 400 });
  const u = await getUser(normEmail(email));
  if (!u || !(await checkPassword(password, u.password)))
    return Response.json({ error: 'Invalid email or password.' }, { status: 401 });
  const token = await createSession({ email: u.email, name: u.name });
  cookies().set(COOKIE, token, cookieOpts);
  return Response.json({ ok: true });
}
