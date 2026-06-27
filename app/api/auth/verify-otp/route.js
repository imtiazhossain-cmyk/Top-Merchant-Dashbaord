import { normEmail } from '@/lib/auth';
import { getOtp, setFlag } from '@/lib/store';
export const runtime = 'nodejs';

export async function POST(req) {
  const { email, code } = await req.json().catch(() => ({}));
  const rec = await getOtp('reg', email);
  if (!rec || rec.exp < Date.now()) return Response.json({ error: 'Code expired — please resend.' }, { status: 400 });
  if (String(code).trim() !== String(rec.code)) return Response.json({ error: 'Incorrect code.' }, { status: 400 });
  await setFlag('verified:reg:' + normEmail(email), 900);
  return Response.json({ ok: true });
}
