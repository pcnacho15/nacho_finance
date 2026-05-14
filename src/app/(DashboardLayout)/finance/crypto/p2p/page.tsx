import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import P2POffersModule from '@/app/components/finance/P2POffersModule';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { to: '/finance/crypto', title: 'Crypto' },
  { title: 'Ofertas P2P' },
];

export default async function P2PPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'user';
  if (role !== 'investor' && role !== 'admin') redirect('/finance');

  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Ofertas P2P" items={BCrumb} />
      <P2POffersModule />
    </div>
  );
}
