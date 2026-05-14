import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-utils';
import { getPusher, PRESENCE_CHANNEL } from '@/lib/pusher';

// Pusher calls this to authorize private/presence channel subscriptions.
// Body is form-encoded (socket_id, channel_name).
export async function POST(request: Request) {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  const pusher = getPusher();
  if (!pusher) {
    return NextResponse.json({ error: 'Realtime no configurado' }, { status: 503 });
  }

  const form = await request.formData();
  const socketId = String(form.get('socket_id') ?? '');
  const channel = String(form.get('channel_name') ?? '');
  if (!socketId || !channel) {
    return NextResponse.json({ error: 'Parámetros faltantes' }, { status: 400 });
  }

  if (channel === PRESENCE_CHANNEL) {
    const user = await prisma.user.findUnique({
      where: { id: guard.userId },
      select: { id: true, name: true, image: true },
    });
    const auth = pusher.authorizeChannel(socketId, channel, {
      user_id: guard.userId,
      user_info: { name: user?.name ?? 'Trader', image: user?.image ?? null },
    });
    return NextResponse.json(auth);
  }

  if (channel.startsWith('private-chat-')) {
    const conversationId = channel.replace('private-chat-', '');
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
    });
    if (
      !conversation ||
      (conversation.userAId !== guard.userId && conversation.userBId !== guard.userId)
    ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    return NextResponse.json(pusher.authorizeChannel(socketId, channel));
  }

  return NextResponse.json({ error: 'Canal no permitido' }, { status: 403 });
}
