import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireUser } from '@/lib/api-utils';
import { categoryCreateSchema, categoryUpdateSchema } from '@/lib/finance-schemas';

export async function GET() {
  const user = await requireUser();
  if ('error' in user) return user.error;
  try {
    const categories = await prisma.category.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'asc' },
    });
    return json(categories);
  } catch (error) {
    return handleError('GET /api/finance/categories', error);
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, categoryCreateSchema);
  if ('error' in parsed) return parsed.error;
  try {
    const category = await prisma.category.create({
      data: { ...parsed.data, userId: user.userId },
    });
    return json(category, { status: 201 });
  } catch (error) {
    return handleError('POST /api/finance/categories', error);
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const parsed = await parseJson(request, categoryUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  try {
    const result = await prisma.category.updateMany({
      where: { id, userId: user.userId },
      data,
    });
    if (result.count === 0) {
      return json({ error: 'No encontrado' }, { status: 404 });
    }
    const category = await prisma.category.findUnique({ where: { id } });
    return json(category);
  } catch (error) {
    return handleError('PUT /api/finance/categories', error);
  }
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  if ('error' in user) return user.error;
  const result = requireId(request);
  if ('error' in result) return result.error;
  try {
    const deleted = await prisma.category.deleteMany({
      where: { id: result.id, userId: user.userId },
    });
    if (deleted.count === 0) {
      return json({ error: 'No encontrado' }, { status: 404 });
    }
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/finance/categories', error);
  }
}
