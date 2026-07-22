import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import WalletsModule from '@/app/components/finance/WalletsModule';
import TronWalletProvider from '@/app/components/finance/TronWalletProvider';
import TronConnectButton from '@/app/components/finance/TronConnectButton';
import EvmConnectButton from '@/app/components/finance/EvmConnectButton';
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
      <TronWalletProvider>
        <div className="grid gap-4 md:grid-cols-2">
          <TronConnectButton />
          <EvmConnectButton />
        </div>
        <WalletsModule />
      </TronWalletProvider>
    </div>
  );
}
