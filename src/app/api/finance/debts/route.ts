import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { debtCreateSchema, debtUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const debts = await prisma.debt.findMany({
      where: { userId: user.userId },
      include: { payments: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return json(debts);
  } catch (error) {
    return handleError('GET /api/finance/debts', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, debtCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const data = {
      ...parsed.data,
      currentAmount: parsed.data.currentAmount ?? parsed.data.originalAmount,
      userId: user.userId,
    };
    const debt = await prisma.debt.create({ data });
    return json(debt, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/debts', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, debtUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.debt.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const debt = await prisma.debt.findUnique({ where: { id } });
    return json(debt);
  } catch (error) {
    return handleError('PUT /api/finance/debts', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.debt.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/debts', error);
  }
}
