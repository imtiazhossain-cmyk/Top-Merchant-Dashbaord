import { validEmail, normEmail, genOtp } from '@/lib/auth';
import { getUser, setOtp } from '@/lib/store';
import { sendOtpEmail } from '@/lib/email';
export const runtime = 'nodejs';

export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!validEmail(email)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const u = await getUser(normEmail(email));
  let dev = false, devCode;
  if (u) {
    const code = genOtp();
    await setOtp('reset', email, code, 600);
    const r = await sendOtpEmail(email, code, 'reset');
    dev = r.dev === true;
    if (process.env.AUTH_DEV_MODE === '1') devCode = code;
  }
  // Always returns ok to avoid leaking which emails are registered.
  return Response.json({ ok: true, dev, ...(devCode ? { devCode } : {}) });
}
