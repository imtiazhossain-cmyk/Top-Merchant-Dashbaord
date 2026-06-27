import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE, verifySession } from '@/lib/session';
import Dashboard from '@/components/Dashboard';
export const runtime = 'nodejs';
export default async function DashboardPage() {
  const session = await verifySession(cookies().get(COOKIE)?.value);
  if (!session) redirect('/login');
  return <Dashboard user={{ email: session.email, name: session.name }} />;
}
