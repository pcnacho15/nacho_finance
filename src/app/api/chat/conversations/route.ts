import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireRole } from '@/lib/api-utils';
import { orderPair, isBlockedBetween } from '@/lib/chat';

const createSchema = z.object({ userId: z.string().min(1) });

type ConvWithUsers = {
  id: string;
  userAId: string;
  userBId: string;
  updatedAt: Date;
  userA: { id: string; name: string | null; email: string; image: string | null };
  userB: { id: string; name: string | null; email: string; image: string | null };
  messages: { id: string; body: string; senderId: string; createdAt: Date }[];
};

const userSelect = { id: true, name: true, email: true, image: true } as const;

export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const me = guard.userId;

  try {
    const [conversations, unread] = await Promise.all([
      prisma.chatConversation.findMany({
        where: { OR: [{ userAId: me }, { userBId: me }] },
        include: {
          userA: { select: userSelect },
          userB: { select: userSelect },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chatMessage.groupBy({
        by: ['conversationId'],
        where: {
          conversation: { OR: [{ userAId: me }, { userBId: me }] },
          senderId: { not: me },
          readAt: null,
        },
        _count: { _all: true },
      }),
    ]);

    const unreadMap = new Map(unread.map((u) => [u.conversationId, u._count._all]));

    const result = (conversations as ConvWithUsers[]).map((c) => {
      const other = c.userAId === me ? c.userB : c.userA;
      return {
        id: c.id,
        other,
        lastMessage: c.messages[0] ?? null,
        unread: unreadMap.get(c.id) ?? 0,
        updatedAt: c.updatedAt,
      };
    });

    return json(result);
  } catch (error) {
    return handleError('GET /api/chat/conversations', error);
  }
}

export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const me = guard.userId;

  const parsed = await parseJson(request, createSchema);
  if ('error' in parsed) return parsed.error;
  const targetId = parsed.data.userId;

  if (targetId === me) {
    return json({ error: 'No puedes chatear contigo mismo' }, { status: 400 });
  }

  try {
    const target = await prisma.user.findFirst({
      where: { id: targetId, role: { in: ['investor', 'admin'] } },
      select: userSelect,
    });
    if (!target) {
      return json({ error: 'Usuario no disponible' }, { status: 404 });
    }
    if (await isBlockedBetween(me, targetId)) {
      return json({ error: 'No puedes iniciar este chat' }, { status: 403 });
    }

    const [userAId, userBId] = orderPair(me, targetId);
    const conversation = await prisma.chatConversation.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      create: { userAId, userBId },
      update: {},
      include: {
        userA: { select: userSelect },
        userB: { select: userSelect },
      },
    });

    const other = conversation.userAId === me ? conversation.userB : conversation.userA;
    return json({ id: conversation.id, other });
  } catch (error) {
    return handleError('POST /api/chat/conversations', error);
  }
}
