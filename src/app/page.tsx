import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Landing from './components/auth/Landing';

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect('/finance');
  return <Landing />;
}
