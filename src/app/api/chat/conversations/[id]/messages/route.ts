import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { handleError, json, parseJson, requireRole } from '@/lib/api-utils';
import { isBlockedBetween } from '@/lib/chat';
import { getPusher, conversationChannel } from '@/lib/pusher';

const sendSchema = z.object({ body: z.string().trim().min(1).max(2000) });

async function loadParticipantConversation(conversationId: string, userId: string) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return null;
  if (conversation.userAId !== userId && conversation.userBId !== userId) return null;
  return conversation;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  try {
    const conversation = await loadParticipantConversation(id, guard.userId);
    if (!conversation) return json({ error: 'Conversación no encontrada' }, { status: 404 });

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
    });

    // Mark the other user's messages as read.
    await prisma.chatMessage.updateMany({
      where: { conversationId: id, senderId: { not: guard.userId }, readAt: null },
      data: { readAt: new Date() },
    });

    return json({ messages });
  } catch (error) {
    return handleError('GET /api/chat/conversations/[id]/messages', error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const parsed = await parseJson(request, sendSchema);
  if ('error' in parsed) return parsed.error;

  try {
    const conversation = await loadParticipantConversation(id, guard.userId);
    if (!conversation) return json({ error: 'Conversación no encontrada' }, { status: 404 });

    const otherId =
      conversation.userAId === guard.userId ? conversation.userBId : conversation.userAId;
    if (await isBlockedBetween(guard.userId, otherId)) {
      return json({ error: 'No puedes enviar mensajes en este chat' }, { status: 403 });
    }

    const message = await prisma.chatMessage.create({
      data: { conversationId: id, senderId: guard.userId, body: parsed.data.body },
    });
    await prisma.chatConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Realtime push is best-effort: if Pusher isn't configured, the message is
    // still persisted and the client picks it up on its next poll.
    const pusher = getPusher();
    if (pusher) {
      await pusher.trigger(conversationChannel(id), 'new-message', message);
    }

    return json(message, { status: 201 });
  } catch (error) {
    return handleError('POST /api/chat/conversations/[id]/messages', error);
  }
}
