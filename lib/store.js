/* Persistence layer.
   - Uses Upstash Redis (Vercel KV) when KV_REST_API_URL/TOKEN (or UPSTASH_*) are set.
   - Otherwise falls back to an in-memory store: perfect for `npm run dev`, but it
     does NOT persist across Vercel's serverless instances. Add KV for production. */
import { Redis } from '@upstash/redis';

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;
if (!redis && process.env.NODE_ENV !== 'production') {
  console.warn('[store] No KV configured — using in-memory store (data resets on restart / per serverless instance).');
}

const mem = globalThis.__cbMem || (globalThis.__cbMem = new Map());

async function set(key, val, ttlSec) {
  if (redis) { await redis.set(key, JSON.stringify(val), ttlSec ? { ex: ttlSec } : undefined); return; }
  mem.set(key, { val, exp: ttlSec ? Date.now() + ttlSec * 1000 : 0 });
}
async function get(key) {
  if (redis) {
    const v = await redis.get(key);
    if (v == null) return null;
    if (typeof v === 'string') { try { return JSON.parse(v); } catch { return v; } }
    return v;
  }
  const e = mem.get(key); if (!e) return null;
  if (e.exp && Date.now() > e.exp) { mem.delete(key); return null; }
  return e.val;
}
async function del(key) { if (redis) { await redis.del(key); return; } mem.delete(key); }

/* users */
const userKey = (email) => 'user:' + email.toLowerCase();
export async function getUser(email) { return await get(userKey(email)); }
export async function saveUser(u) { await set(userKey(u.email), u); }

/* otp + short-lived flags */
const otpKey = (scope, email) => `otp:${scope}:${email.toLowerCase()}`;
export async function setOtp(scope, email, code, ttlSec) { await set(otpKey(scope, email), { code, exp: Date.now() + ttlSec * 1000 }, ttlSec); }
export async function getOtp(scope, email) { return await get(otpKey(scope, email)); }
export async function delOtp(scope, email) { await del(otpKey(scope, email)); }
export async function setFlag(key, ttlSec) { await set('flag:' + key, 1, ttlSec); }
export async function getFlag(key) { return await get('flag:' + key); }
export async function delFlag(key) { await del('flag:' + key); }
