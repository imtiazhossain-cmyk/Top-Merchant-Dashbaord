import { isAllowedEmail, normEmail, hashPassword } from '@/lib/auth';
import { getUser, saveUser, getFlag, delFlag, delOtp } from '@/lib/store';
export const runtime = 'nodejs';

export async function POST(req) {
  const { name, department, position, email, password, confirm } = await req.json().catch(() => ({}));
  if (!isAllowedEmail(email)) return Response.json({ error: 'Registration is restricted to @carrybee.com email addresses.' }, { status: 403 });
  if (!(await getFlag('verified:reg:' + normEmail(email)))) return Response.json({ error: 'Please verify your email with the code first.' }, { status: 400 });
  if (!name || !department || !position) return Response.json({ error: 'Name, department and position are required.' }, { status: 400 });
  if (!password || password.length < 8) return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  if (password !== confirm) return Response.json({ error: 'Passwords do not match.' }, { status: 400 });
  if (await getUser(normEmail(email))) return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
  await saveUser({ email: normEmail(email), name, department, position, password: await hashPassword(password), createdAt: Date.now() });
  await delOtp('reg', email);
  await delFlag('verified:reg:' + normEmail(email));
  return Response.json({ ok: true });
}
