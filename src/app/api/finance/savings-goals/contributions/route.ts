import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { savingsContributionSchema } from '@/lib/finance-schemas';

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, savingsContributionSchema);
  if ('error' in parsed) return parsed.error;
  const { goalId, amount, notes } = parsed.data;

  try {
    const contribution = await prisma.$transaction(async (tx) => {
      const goal = await tx.savingsGoal.findFirst({
        where: { id: goalId, userId: user.userId },
      });
      if (!goal) throw new Error('NOT_FOUND');
      const amountDec = new Prisma.Decimal(amount);
      const newCurrent = goal.currentAmount.plus(amountDec);
      const created = await tx.savingsContribution.create({
        data: { goalId, amount: amountDec, date: new Date(), notes: notes ?? null },
      });
      await tx.savingsGoal.update({
        where: { id: goalId },
        data: {
          currentAmount: newCurrent,
          status: newCurrent.gte(goal.targetAmount ?? 0) ? 'completed' : goal.status,
        },
      });
      return created;
    });
    return json(contribution, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return json({ error: 'Meta no encontrada' }, { status: 404 });
    }
    return handleError('POST /api/finance/savings-goals/contributions', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.savingsContribution.deleteMany({
      where: { id: result.id, goal: { userId: user.userId } },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/savings-goals/contributions', error);
  }
}
