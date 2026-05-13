import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { incomeCreateSchema, incomeUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const incomes = await prisma.income.findMany({
      where: { userId: user.userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });
    return json(incomes);
  } catch (error) {
    return handleError('GET /api/finance/incomes', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, incomeCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const category = await prisma.category.findFirst({
      where: { id: parsed.data.categoryId, userId: user.userId },
    });
    if (!category) return json({ error: 'Categoría inválida' }, { status: 400 });
    const income = await prisma.income.create({
      data: { ...parsed.data, userId: user.userId },
      include: { category: true },
    });
    return json(income, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/incomes', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, incomeUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.income.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    const income = await prisma.income.findUnique({
      where: { id },
      include: { category: true },
    });
    return json(income);
  } catch (error) {
    return handleError('PUT /api/finance/incomes', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.income.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) return json({ error: 'No encontrado' }, { status: 404 });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/incomes', error);
  }
}
