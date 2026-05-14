import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PnlDashboardModule from '@/app/components/finance/PnlDashboardModule';
import BreadcrumbComp from '@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp';

const BCrumb = [
  { to: '/', title: 'Home' },
  { to: '/finance', title: 'Finanzas' },
  { to: '/finance/crypto', title: 'Crypto' },
  { title: 'Dashboard P&L' },
];

export default async function PnlDashboardPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'user';
  if (role !== 'investor' && role !== 'admin') redirect('/finance');

  return (
    <div className="space-y-6">
      <BreadcrumbComp title="Dashboard de Ganancias" items={BCrumb} />
      <PnlDashboardModule />
    </div>
  );
}
