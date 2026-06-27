/* Secure serverless data route. Session-gated; SHEET_ID stays server-side; the
   browser calls only /api/data so there are no CORS issues. */
import { cookies } from 'next/headers';
import Papa from 'papaparse';
import { COOKIE, verifySession } from '@/lib/session';
export const runtime = 'nodejs';

const SHEET_ID = process.env.SHEET_ID;
const TABS = {
  daily: 'Daily Merchant Summary',
  fwdTerm: 'Forward Aging Analysis - Terminal',
  fwdProc: 'Forward Aging Analysis - In Process',
  revTerm: 'Reverse Aging Analysis - Terminal',
  revProc: 'Reverse Aging Analysis - In Process',
  cohort: 'Sorted Cohort Summary',
  financial: 'Financial Detail',
};
const csvUrl = (tab) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;

async function fetchTab(tab, revalidate) {
  const res = await fetch(csvUrl(tab), { next: { revalidate } });
  if (!res.ok) throw new Error(`Sheet fetch failed for "${tab}" (${res.status})`);
  return Papa.parse(await res.text(), { header: true, skipEmptyLines: true, dynamicTyping: true }).data;
}

export async function GET(request) {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!SHEET_ID) return Response.json({ error: 'SHEET_ID environment variable is not set.' }, { status: 500 });
  const refresh = new URL(request.url).searchParams.get('refresh');
  const revalidate = refresh ? 0 : 600;
  try {
    const keys = Object.keys(TABS);
    const results = await Promise.all(keys.map((k) => fetchTab(TABS[k], revalidate)));
    const tabs = {}; keys.forEach((k, i) => { tabs[k] = results[i]; });
    return Response.json({ generatedAt: new Date().toISOString(), tabs },
      { headers: { 'Cache-Control': 'private, s-maxage=600, stale-while-revalidate=1200' } });
  } catch (e) { return Response.json({ error: String(e?.message || e) }, { status: 502 }); }
}
