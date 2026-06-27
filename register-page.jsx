'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Bee from '@/components/Bee';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1=details, 2=otp, 3=password
  const [form, setForm] = useState({ name: '', department: '', position: '', email: '' });
  const [code, setCode] = useState('');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const sendOtp = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not send code.');
      setStep(2);
      setMsg(j.devCode ? `Dev code: ${j.devCode}` : j.dev ? 'A code was logged to the server console (dev mode).' : 'Verification code sent to your inbox.');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const verify = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, code }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Verification failed.');
      setStep(3);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const register = async () => {
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, password, confirm }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Registration failed.');
      router.push('/login');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const detailsValid = form.name && form.department && form.position && form.email;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-char text-white p-12">
        <div className="flex items-center gap-3"><Bee /><span className="font-display font-semibold text-lg">Carry Bee</span></div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">Create your<br /><span className="text-bee">account</span></h1>
          <p className="text-charmut mt-4 max-w-sm">Registration is restricted to Carry Bee staff with an <b className="text-white">@carrybee.com</b> email address.</p>
        </div>
        <ol className="text-charmut2 text-xs space-y-1">
          <li className={step >= 1 ? 'text-bee' : ''}>1 · Your details</li>
          <li className={step >= 2 ? 'text-bee' : ''}>2 · Verify email (OTP)</li>
          <li className={step >= 3 ? 'text-bee' : ''}>3 · Set a password</li>
        </ol>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center"><Bee /><span className="font-display font-semibold text-lg">Carry Bee</span></div>
          <h2 className="font-display text-2xl font-bold text-center">Sign up</h2>
          <p className="text-ink3 text-sm text-center mt-1 mb-7">
            {step === 1 && 'Use your @carrybee.com email.'}
            {step === 2 && 'Enter the code we sent you.'}
            {step === 3 && 'Almost done — set a password.'}
          </p>

          {step === 1 && (
            <div className="space-y-3">
              <input className="field" placeholder="Full name" value={form.name} onChange={set('name')} />
              <input className="field" placeholder="Department" value={form.department} onChange={set('department')} />
              <input className="field" placeholder="Position" value={form.position} onChange={set('position')} />
              <input className="field" type="email" placeholder="name@carrybee.com" value={form.email} onChange={set('email')} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <div className="text-[13px] text-ink2 bg-page border border-line rounded-[10px] px-3 py-2">{form.email}</div>
              <input className="field tracking-[6px] text-center text-lg" placeholder="––––––" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="text-[13px] text-ink2 hover:text-ink" onClick={sendOtp} disabled={busy}>Resend code</button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <input className="field" type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input className="field" type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          )}

          {err && <div className="text-bad text-[13px] mt-3">{err}</div>}
          {msg && <div className="text-ok text-[13px] mt-3">{msg}</div>}

          <div className="mt-5 space-y-2.5">
            {step === 1 && <button className="btn-primary" disabled={busy || !detailsValid} onClick={sendOtp}>{busy ? 'Sending…' : 'Send verification code'}</button>}
            {step === 2 && <button className="btn-primary" disabled={busy || !code} onClick={verify}>{busy ? 'Verifying…' : 'Verify code'}</button>}
            {step === 3 && <button className="btn-primary" disabled={busy || !password || !confirm} onClick={register}>{busy ? 'Creating…' : 'Register'}</button>}
            <button className="w-full border border-line text-ink font-semibold rounded-[10px] py-[11px] text-[14px] hover:bg-page transition" onClick={() => router.push('/login')}>Back to sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
