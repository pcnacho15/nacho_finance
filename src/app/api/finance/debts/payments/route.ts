import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { debtPaymentSchema } from '@/lib/finance-schemas';

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, debtPaymentSchema);
  if ('error' in parsed) return parsed.error;
  const { debtId, amount, notes } = parsed.data;

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findFirst({ where: { id: debtId, userId: user.userId } });
      if (!debt) throw new Error('NOT_FOUND');
      const amountDec = new Prisma.Decimal(amount);
      const newCurrent = Prisma.Decimal.max(0, debt.currentAmount.minus(amountDec));
      const newPaid = debt.paidAmount.plus(amountDec);
      const created = await tx.debtPayment.create({
        data: { debtId, amount: amountDec, date: new Date(), notes: notes ?? null },
      });
      await tx.debt.update({
        where: { id: debtId },
        data: {
          currentAmount: newCurrent,
          paidAmount: newPaid,
          status: newCurrent.lte(0) ? 'paid' : debt.status,
        },
      });
      return created;
    });
    return json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return json({ error: 'Deuda no encontrada' }, { status: 404 });
    }
    return handleError('POST /api/finance/debts/payments', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.debtPayment.deleteMany({
      where: { id: result.id, debt: { userId: user.userId } },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/debts/payments', error);
  }
}
