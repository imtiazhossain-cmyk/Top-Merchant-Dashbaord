import { normEmail, hashPassword } from '@/lib/auth';
import { getUser, saveUser, getOtp, delOtp } from '@/lib/store';
export const runtime = 'nodejs';

export async function POST(req) {
  const { email, code, password, confirm } = await req.json().catch(() => ({}));
  const rec = await getOtp('reset', email);
  if (!rec || rec.exp < Date.now() || String(code).trim() !== String(rec.code))
    return Response.json({ error: 'Invalid or expired code.' }, { status: 400 });
  if (!password || password.length < 8) return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  if (password !== confirm) return Response.json({ error: 'Passwords do not match.' }, { status: 400 });
  const u = await getUser(normEmail(email));
  if (!u) return Response.json({ error: 'Account not found.' }, { status: 404 });
  u.password = await hashPassword(password);
  await saveUser(u);
  await delOtp('reset', email);
  return Response.json({ ok: true });
}
