import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireRole } from '@/lib/api-utils';
import { walletTransactionCreateSchema } from '@/lib/finance-schemas';

export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const parsed = await parseJson(request, walletTransactionCreateSchema);
  if ('error' in parsed) return parsed.error;
  const { walletId, type, amount, pricePerUnit, date, counterparty, notes } = parsed.data;

  try {
    const wallet = await prisma.wallet.findFirst({
      where: { id: walletId, userId: guard.userId },
    });
    if (!wallet) return json({ error: 'Billetera no encontrada' }, { status: 404 });
    const tx = await prisma.walletTransaction.create({
      data: {
        walletId,
        type,
        amount,
        pricePerUnit: pricePerUnit ?? null,
        date,
        counterparty: counterparty ?? null,
        notes: notes ?? null,
      },
    });
    return json(tx, { status: 201 });
  } catch (error) {
    return handleError('POST /api/crypto/wallets/transactions', error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.walletTransaction.deleteMany({
      where: { id: result.id, wallet: { userId: guard.userId } },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/crypto/wallets/transactions', error);
  }
}
