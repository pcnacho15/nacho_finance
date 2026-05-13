import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { savingsGoalCreateSchema, savingsGoalUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: user.userId },
      include: { contributions: { orderBy: { date: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return json(goals);
  } catch (error) {
    return handleError('GET /api/finance/savings-goals', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, savingsGoalCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const goal = await prisma.savingsGoal.create({
      data: { ...parsed.data, userId: user.userId },
    });
    return json(goal, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/savings-goals', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, savingsGoalUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.savingsGoal.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const goal = await prisma.savingsGoal.findUnique({ where: { id } });
    return json(goal);
  } catch (error) {
    return handleError('PUT /api/finance/savings-goals', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.savingsGoal.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/savings-goals', error);
  }
}
