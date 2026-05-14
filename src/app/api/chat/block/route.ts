import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireId, requireRole } from '@/lib/api-utils';

const blockSchema = z.object({ userId: z.string().min(1) });

export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const parsed = await parseJson(request, blockSchema);
  if ('error' in parsed) return parsed.error;
  const targetId = parsed.data.userId;

  if (targetId === guard.userId) {
    return json({ error: 'Acción inválida' }, { status: 400 });
  }

  try {
    await prisma.chatBlock.upsert({
      where: { blockerId_blockedId: { blockerId: guard.userId, blockedId: targetId } },
      create: { blockerId: guard.userId, blockedId: targetId },
      update: {},
    });
    return json({ success: true });
  } catch (error) {
    return handleError('POST /api/chat/block', error);
  }
}

export async function DELETE(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const result = requireId(request);
  if ('error' in result) return result.error;

  try {
    await prisma.chatBlock.deleteMany({
      where: { blockerId: guard.userId, blockedId: result.id },
    });
    return json({ success: true });
  } catch (error) {
    return handleError('DELETE /api/chat/block', error);
  }
}
