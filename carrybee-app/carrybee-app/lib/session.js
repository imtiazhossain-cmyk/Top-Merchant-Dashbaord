/* Edge-safe session helpers — JWT in an httpOnly cookie (no native deps). */
import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-insecure-secret-change-me-please');
export const COOKIE = 'cb_session';

export async function createSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}
export async function verifySession(token) {
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return payload; } catch { return null; }
}
export const cookieOpts = {
  httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7,
};
