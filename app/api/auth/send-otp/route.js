import { isAllowedEmail, validEmail, normEmail, genOtp } from '@/lib/auth';
import { getUser, setOtp } from '@/lib/store';
import { sendOtpEmail } from '@/lib/email';
export const runtime = 'nodejs';

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!validEmail(email)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (!isAllowedEmail(email)) return Response.json({ error: 'Registration is restricted to @carrybee.com email addresses.' }, { status: 403 });
  if (await getUser(normEmail(email))) return Response.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
  const code = genOtp();
  await setOtp('reg', email, code, 600);
  const r = await sendOtpEmail(email, code, 'verify');
  return Response.json({ ok: true, dev: r.dev === true, ...(process.env.AUTH_DEV_MODE === '1' ? { devCode: code } : {}) });
}
