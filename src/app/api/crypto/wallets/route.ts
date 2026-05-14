import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireRole } from '@/lib/api-utils';
import { walletCreateSchema, walletUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  try {
    const wallets = await prisma.wallet.findMany({
      where: { userId: guard.userId },
      include: { transactions: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return json(wallets);
  } catch (error) {
    return handleError('GET /api/crypto/wallets', error);
  }
}

export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const parsed = await parseJson(request, walletCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const wallet = await prisma.wallet.create({
      data: { ...parsed.data, userId: guard.userId },
      include: { transactions: true },
    });
    return json(wallet, { status: 201 });
  } catch (error) {
    return handleError('POST /api/crypto/wallets', error);
  }
}

export async function PUT(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const parsed = await parseJson(request, walletUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, archivedAt, ...rest } = parsed.data;
  try {
    const data: Record<string, unknown> = { ...rest };
    if (archivedAt !== undefined) {
      data.archivedAt = archivedAt === null ? null : new Date(archivedAt);
    }
    const result = await prisma.wallet.updateMany({
      where: { id, userId: guard.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const wallet = await prisma.wallet.findUnique({
      where: { id },
      include: { transactions: { orderBy: { date: 'desc' } } },
    });
    return json(wallet);
  } catch (error) {
    return handleError('PUT /api/crypto/wallets', error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.wallet.deleteMany({
      where: { id: result.id, userId: guard.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/crypto/wallets', error);
  }
}
