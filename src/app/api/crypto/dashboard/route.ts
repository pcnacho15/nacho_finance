import { prisma } from '@/lib/prisma';
import { handleError, json, requireRole } from '@/lib/api-utils';
import { computePnl, type PnlTransaction, type PnlTxType } from '@/lib/pnl';

export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: guard.userId },
      include: { transactions: true },
    });

    const txs: PnlTransaction[] = wallets
      .flatMap((w) => w.transactions)
      .map((t) => ({
        type: t.type as PnlTxType,
        amount: t.amount.toNumber(),
        pricePerUnit: t.pricePerUnit != null ? t.pricePerUnit.toNumber() : null,
        date: t.date,
      }));

    return json(computePnl(txs));
  } catch (error) {
    return handleError('GET /api/crypto/dashboard', error);
  }
}
