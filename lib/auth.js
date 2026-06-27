/* Node-only auth helpers: password hashing, domain rules, OTP generation. */
import bcrypt from 'bcryptjs';

export const ALLOWED_DOMAIN = 'carrybee.com';
export const isAllowedEmail = (e) => typeof e === 'string' && e.trim().toLowerCase().endsWith('@' + ALLOWED_DOMAIN);
export const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((e || '').trim());
export const normEmail = (e) => (e || '').trim().toLowerCase();
export const hashPassword = (p) => bcrypt.hash(p, 10);
export const checkPassword = (p, h) => bcrypt.compare(p, h);
export const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));
