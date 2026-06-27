'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Bee from '@/components/Bee';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [forgot, setForgot] = useState(false); // false | 'request' | 'reset'
  const [fEmail, setFEmail] = useState('');
  const [code, setCode] = useState('');
  const [np, setNp] = useState(''); const [nc, setNc] = useState('');
  const [msg, setMsg] = useState('');

  const signIn = async () => {
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Sign in failed.');
      router.push('/dashboard'); router.refresh();
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const sendReset = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fEmail }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Could not send code.');
      setForgot('reset');
      setMsg(j.devCode ? `Dev code: ${j.devCode}` : j.dev ? 'A code was logged to the server console (dev mode).' : 'If that email is registered, a reset code is on its way.');
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const doReset = async () => {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fEmail, code, password: np, confirm: nc }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Reset failed.');
      setForgot(false); setMsg('Password updated — please sign in.'); setEmail(fEmail);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-char text-white p-12">
        <div className="flex items-center gap-3"><Bee /><span className="font-display font-semibold text-lg">Carry Bee</span></div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">Top Merchant<br /><span className="text-bee">Analytics</span></h1>
          <p className="text-charmut mt-4 max-w-sm">Live operations, cohort performance, aging, reverse journeys and financials — for Carry Bee's top merchants.</p>
        </div>
        <div className="text-charmut2 text-xs">Restricted access · @carrybee.com</div>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center"><Bee /><span className="font-display font-semibold text-lg">Carry Bee</span></div>

          {!forgot && (
            <>
              <h2 className="font-display text-2xl font-bold text-center">Sign in</h2>
              <p className="text-ink3 text-sm text-center mt-1 mb-7">Welcome back to the operations dashboard.</p>
              <div className="space-y-3">
                <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && signIn()} />
                <input className="field" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && signIn()} />
              </div>
              <button className="text-[13px] text-ink2 hover:text-ink mt-2.5" onClick={() => { setForgot('request'); setErr(''); setMsg(''); setFEmail(email); }}>Forgot password?</button>
              {err && <div className="text-bad text-[13px] mt-3">{err}</div>}
              {msg && <div className="text-ok text-[13px] mt-3">{msg}</div>}
              <div className="mt-5 space-y-2.5">
                <button className="btn-primary" disabled={busy} onClick={signIn}>{busy ? 'Signing in…' : 'Sign In'}</button>
                <button className="w-full border border-line text-ink font-semibold rounded-[10px] py-[11px] text-[14px] hover:bg-page transition" onClick={() => router.push('/register')}>Sign Up</button>
              </div>
            </>
          )}

          {forgot === 'request' && (
            <>
              <h2 className="font-display text-2xl font-bold text-center">Reset password</h2>
              <p className="text-ink3 text-sm text-center mt-1 mb-7">We'll email you a verification code.</p>
              <input className="field" type="email" placeholder="Your email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
              {err && <div className="text-bad text-[13px] mt-3">{err}</div>}
              {msg && <div className="text-ok text-[13px] mt-3">{msg}</div>}
              <div className="mt-5 space-y-2.5">
                <button className="btn-primary" disabled={busy} onClick={sendReset}>{busy ? 'Sending…' : 'Send code'}</button>
                <button className="w-full border border-line text-ink font-semibold rounded-[10px] py-[11px] text-[14px] hover:bg-page transition" onClick={() => { setForgot(false); setErr(''); setMsg(''); }}>Back to sign in</button>
              </div>
            </>
          )}

          {forgot === 'reset' && (
            <>
              <h2 className="font-display text-2xl font-bold text-center">Enter code</h2>
              <p className="text-ink3 text-sm text-center mt-1 mb-7">Check your inbox, then set a new password.</p>
              <div className="space-y-3">
                <input className="field tracking-[4px] text-center" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} />
                <input className="field" type="password" placeholder="New password (min 8 chars)" value={np} onChange={(e) => setNp(e.target.value)} />
                <input className="field" type="password" placeholder="Confirm new password" value={nc} onChange={(e) => setNc(e.target.value)} />
              </div>
              {err && <div className="text-bad text-[13px] mt-3">{err}</div>}
              {msg && <div className="text-ink3 text-[13px] mt-3">{msg}</div>}
              <div className="mt-5 space-y-2.5">
                <button className="btn-primary" disabled={busy} onClick={doReset}>{busy ? 'Updating…' : 'Update password'}</button>
                <button className="w-full border border-line text-ink font-semibold rounded-[10px] py-[11px] text-[14px] hover:bg-page transition" onClick={() => { setForgot(false); setErr(''); setMsg(''); }}>Back to sign in</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
