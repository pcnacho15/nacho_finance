import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireRole } from '@/lib/api-utils';
import { walletSyncSchema } from '@/lib/finance-schemas';
import { getChainAdapter } from '@/lib/onchain';

// Pulls USDT transfers for a connected wallet (TRON or Ethereum) from the chain's
// read-only adapter and stores the new ones, deduplicating by (walletId, txHash).
// Returns how many were added plus the live on-chain balance.
export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const parsed = await parseJson(request, walletSyncSchema);
  if ('error' in parsed) return parsed.error;

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { id: parsed.data.walletId, userId: guard.userId },
    });
    if (!wallet) return json({ error: 'No encontrado' }, { status: 404 });
    if (wallet.source !== 'onchain' || !wallet.address) {
      return json({ error: 'La billetera no está conectada a una cadena' }, { status: 400 });
    }

    const adapter = getChainAdapter(wallet.chain);
    const mapped = await adapter.getTransfers(wallet.address);

    // Only insert transfers we haven't seen; the unique index also guards races.
    const hashes = mapped.map((m) => m.txHash);
    const known = new Set(
      (
        await prisma.walletTransaction.findMany({
          where: { walletId: wallet.id, txHash: { in: hashes } },
          select: { txHash: true },
        })
      ).map((r) => r.txHash),
    );
    const toCreate = mapped.filter((m) => !known.has(m.txHash));

    if (toCreate.length > 0) {
      await prisma.walletTransaction.createMany({
        data: toCreate.map((t) => ({
          walletId: wallet.id,
          type: t.type,
          amount: t.amount,
          date: t.date,
          source: 'onchain',
          txHash: t.txHash,
          fromAddress: t.fromAddress,
          toAddress: t.toAddress,
          blockTimestamp: t.date,
        })),
        skipDuplicates: true,
      });
    }

    const balance = await adapter.getBalance(wallet.address);
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { lastSyncedAt: new Date() },
    });

    return json({ synced: toCreate.length, total: mapped.length, balance });
  } catch (error) {
    return handleError('POST /api/crypto/wallets/sync', error);
  }
}
