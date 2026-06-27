/* Sends OTP emails via SMTP. If SMTP env vars are absent, logs the code to the
   server console (dev mode) so the flow is testable without an email provider. */
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST, port = process.env.SMTP_PORT, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
const FROM = process.env.SMTP_FROM || 'Carry Bee <no-reply@carrybee.com>';
const transporter = host && user && pass
  ? nodemailer.createTransport({ host, port: Number(port || 587), secure: Number(port) === 465, auth: { user, pass } })
  : null;

export function emailConfigured() { return !!transporter; }

export async function sendOtpEmail(to, code, purpose) {
  const subject = purpose === 'reset' ? 'Your Carry Bee password reset code' : 'Your Carry Bee verification code';
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #E8EAEE;border-radius:14px;overflow:hidden">
    <div style="background:#15171C;padding:20px 24px;color:#fff;display:flex;align-items:center;gap:10px">
      <span style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#FFCC00;color:#1A1606;font-weight:700">CB</span>
      <strong style="font-size:16px">Carry Bee</strong>
    </div>
    <div style="padding:26px 24px;color:#181B21">
      <p style="margin:0 0 12px">Use this verification code to ${purpose === 'reset' ? 'reset your password' : 'complete your registration'}:</p>
      <div style="font-size:30px;font-weight:700;letter-spacing:6px;background:#F6F7F9;border:1px solid #E8EAEE;border-radius:10px;padding:14px;text-align:center;color:#15171C">${code}</div>
      <p style="margin:16px 0 0;font-size:13px;color:#5C636F">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  </div>`;
  if (!transporter) { console.log(`[DEV OTP] (${purpose}) ${to} => ${code}`); return { dev: true }; }
  await transporter.sendMail({ from: FROM, to, subject, html, text: `Your Carry Bee code is ${code} (expires in 10 minutes).` });
  return { dev: false };
}
