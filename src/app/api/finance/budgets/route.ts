import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { budgetCreateSchema, budgetUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: user.userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return json(budgets);
  } catch (error) {
    return handleError('GET /api/finance/budgets', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, budgetCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.userId },
    });
    if (!category) return json({ error: 'Categoría inválida' }, { status: 400 });
    const budget = await prisma.budget.create({
      data: { ...parsed.data, userId: user.userId },
      include: { category: true },
    });
    return json(budget, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/budgets', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, budgetUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.budget.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });
    return json(budget);
  } catch (error) {
    return handleError('PUT /api/finance/budgets', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.budget.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/budgets', error);
  }
}
