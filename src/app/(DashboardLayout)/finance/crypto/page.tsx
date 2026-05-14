import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import UsdtPriceChart from '@/app/components/finance/UsdtPriceChart';

export default async function CryptoPage() {
  const session = await auth();
  const role = session?.user?.role ?? 'user';
  if (role !== 'investor' && role !== 'admin') redirect('/finance');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">USDT en tiempo real</h1>
        <p className="text-sm text-muted-foreground">
          Precio del Tether (USDT) en dólares.
        </p>
      </div>
      <UsdtPriceChart />
    </div>
  );
}
