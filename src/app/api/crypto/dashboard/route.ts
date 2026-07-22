import { prisma } from '@/lib/prisma';
import { handleError, json, requireRole } from '@/lib/api-utils';
import { computePnl, type PnlTransaction, type PnlTxType } from '@/lib/pnl';

// Splits the portfolio into two things that must not be mixed:
//   - Trading P&L  → average-cost-basis over MANUAL wallet transactions (buy/sell
//     carry a price, so a cost basis exists).
//   - On-chain custody → the real USDT balance held in connected wallets. Their
//     transfers map to price-less deposit/withdrawal, so a cost basis is unknown;
//     feeding them into computePnl would corrupt avg cost / holdings. We only
//     report their balance.
export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: guard.userId, archivedAt: null },
      include: { transactions: true },
    });

    const tradingWallets = wallets.filter((w) => w.source !== 'onchain');
    const custodyWallets = wallets.filter((w) => w.source === 'onchain');

    const txs: PnlTransaction[] = tradingWallets
      .flatMap((w) => w.transactions)
      .map((t) => ({
        type: t.type as PnlTxType,
        amount: t.amount.toNumber(),
        pricePerUnit: t.pricePerUnit != null ? t.pricePerUnit.toNumber() : null,
        date: t.date,
      }));

    // On-chain holdings = incoming (deposit) − outgoing (withdrawal) per wallet.
    const walletHoldings = (w: (typeof custodyWallets)[number]) =>
      w.transactions.reduce((sum, t) => {
        const amt = t.amount.toNumber();
        return t.type === 'deposit' || t.type === 'buy' ? sum + amt : sum - amt;
      }, 0);

    const byChain = { tron: 0, ethereum: 0 };
    for (const w of custodyWallets) {
      const chain = w.chain === 'ethereum' ? 'ethereum' : 'tron';
      byChain[chain] += walletHoldings(w);
    }
    const custodyHoldings = byChain.tron + byChain.ethereum;

    return json({
      trading: computePnl(txs),
      custody: {
        holdings: custodyHoldings,
        walletCount: custodyWallets.length,
        byChain,
      },
    });
  } catch (error) {
    return handleError('GET /api/crypto/dashboard', error);
  }
}
