import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import WalletsModule from '@/app/components/finance/WalletsModule';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { to: '/finance/crypto', title: 'Crypto' },
  { title: 'Billeteras' },
];

export default async function WalletsPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'user';
  if (role !== 'investor' && role !== 'admin') redirect('/finance');

  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Mis Billeteras" items={BCrumb} />
      <WalletsModule />
    </div>
  );
}
