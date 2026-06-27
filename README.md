# Carry Bee — Operations Dashboard (Next.js + Auth, Vercel-ready)

Domain-restricted email/OTP authentication wrapping the Top Merchant Analytics
dashboard. Built on Next.js (App Router), deployable to Vercel.

## What's inside
- **Login** (`/login`) — email + password, "Sign Up", and a Forgot-password OTP flow.
- **Register** (`/register`) — locked to `@carrybee.com`. Flow: details → email OTP →
  verify → reveal Password + Confirm → create account → back to login.
- **Dashboard** (`/dashboard`) — the full six-tab analytics app, protected by
  `middleware.js` (unauthenticated users are redirected to `/login`).
- **Auth backend** — `app/api/auth/*` (login, logout, me, send-otp, verify-otp,
  register, forgot, reset). Sessions are signed JWTs (`jose`) in an httpOnly cookie;
  passwords hashed with `bcryptjs`.
- **Data** — `app/api/data` fetches the Google Sheet server-side (gviz CSV); the
  `SHEET_ID` never reaches the browser and the route is session-gated.

## Storage & email
- **Persistence:** uses **Vercel KV / Upstash Redis** when `KV_REST_API_URL` +
  `KV_REST_API_TOKEN` are set. Without them it falls back to an in-memory store —
  perfect for local `npm run dev`, but it does NOT persist across Vercel's
  serverless instances, so **add KV before relying on it in production**.
- **Email (OTP):** uses SMTP when `SMTP_*` vars are set. Without SMTP, codes are
  logged to the server console; set `AUTH_DEV_MODE=1` to also surface the code in
  the UI for local testing. **Set `AUTH_DEV_MODE=0` (or remove it) in production.**

## Local setup
```bash
npm install
cp .env.local.example .env.local     # SHEET_ID is pre-filled; set AUTH_SECRET
npm run dev                           # http://localhost:3000
```
With no SMTP/KV configured you can still register + log in locally: the OTP appears
in the UI (because `AUTH_DEV_MODE=1`) and on the server console. The sheet must be
shared "Anyone with the link can view".

## Deploy to Vercel
```bash
npm i -g vercel
vercel login
vercel                                # first deploy
# add environment variables (Settings ▸ Environment Variables or CLI):
vercel env add SHEET_ID production
vercel env add AUTH_SECRET production
vercel env add KV_REST_API_URL production
vercel env add KV_REST_API_TOKEN production
vercel env add SMTP_HOST production    # + SMTP_PORT/USER/PASS/FROM
vercel --prod
```
Tip: the easiest KV setup is Vercel ▸ Storage ▸ KV, which injects
`KV_REST_API_URL`/`KV_REST_API_TOKEN` automatically.

## Notes
- Registration domain is `carrybee.com` (`lib/auth.js → ALLOWED_DOMAIN`).
- OTPs expire in 10 minutes; sessions last 7 days.
- Dashboard logic (metrics/charts) is unchanged from the standalone app, including
  the Cohort Return card, the COD/Delivery/Discount fee-trend curves, and the
  cohort-sourced Merchant Health Matrix.
