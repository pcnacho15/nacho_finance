import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireRole } from '@/lib/api-utils';
import { walletConnectSchema } from '@/lib/finance-schemas';
import { getChainAdapter, normalizeAddress } from '@/lib/onchain';

// Links an on-chain address (TRON or Ethereum) to the user, read-only. Idempotent:
// re-connecting the same address returns the existing wallet instead of duplicating.
// Ownership is trusted from the connected wallet (no signature yet — Fase 1 decision).
export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const parsed = await parseJson(request, walletConnectSchema);
  if ('error' in parsed) return parsed.error;

  const { chain, name } = parsed.data;
  const adapter = getChainAdapter(chain);
  if (!adapter.isValidAddress(parsed.data.address)) {
    return json({ error: 'Dirección inválida para la cadena seleccionada' }, { status: 400 });
  }
  const address = normalizeAddress(chain, parsed.data.address);

  try {
    const existing = await prisma.wallet.findFirst({
      where: { userId: guard.userId, address },
      include: { transactions: { orderBy: { date: 'desc' } } },
    });
    if (existing) return json(existing);

    const label = chain === 'ethereum' ? 'ETH' : 'TRON';
    const wallet = await prisma.wallet.create({
      data: {
        userId: guard.userId,
        name: name?.trim() || `${label} ${address.slice(0, 6)}…${address.slice(-4)}`,
        type: 'hot',
        asset: 'USDT',
        network: adapter.networkLabel,
        source: 'onchain',
        chain,
        address,
      },
      include: { transactions: true },
    });
    return json(wallet, { status: 201 });
  } catch (error) {
    return handleError('POST /api/crypto/wallets/connect', error);
  }
}
