import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { fixedExpenseCreateSchema, fixedExpenseUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: { userId: user.userId },
      include: { category: true },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
    return json(fixedExpenses);
  } catch (error) {
    return handleError('GET /api/finance/fixed-expenses', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, fixedExpenseCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.userId },
    });
    if (!category) return json({ error: 'Categoría inválida' }, { status: 400 });
    const fixedExpense = await prisma.fixedExpense.create({
      data: { ...parsed.data, userId: user.userId },
      include: { category: true },
    });
    return json(fixedExpense, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/fixed-expenses', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, fixedExpenseUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, userId: user.userId },
      });
      if (!category) return json({ error: 'Categoría inválida' }, { status: 400 });
    }
    const result = await prisma.fixedExpense.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const fixedExpense = await prisma.fixedExpense.findUnique({
      where: { id },
      include: { category: true },
    });
    return json(fixedExpense);
  } catch (error) {
    return handleError('PUT /api/finance/fixed-expenses', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.fixedExpense.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/fixed-expenses', error);
  }
}
