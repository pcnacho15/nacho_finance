import { prisma } from '@/lib/prisma';
import { handleError, json, requireRole } from '@/lib/api-utils';

// Lists premium users (potential chat partners) except the current user and
// anyone who has blocked them. Includes a `blockedByMe` flag for unblock UX.
export async function GET() {
  const guard = await requireRole('investor', 'admin');
  if ('error' in guard) return guard.error;

  try {
    const [users, blocks] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: { in: ['investor', 'admin'] },
          id: { not: guard.userId },
        },
        select: { id: true, name: true, email: true, image: true },
        orderBy: { name: 'asc' },
      }),
      prisma.chatBlock.findMany({
        where: {
          OR: [{ blockerId: guard.userId }, { blockedId: guard.userId }],
        },
      }),
    ]);

    const blockedMe = new Set(
      blocks.filter((b) => b.blockedId === guard.userId).map((b) => b.blockerId),
    );
    const blockedByMe = new Set(
      blocks.filter((b) => b.blockerId === guard.userId).map((b) => b.blockedId),
    );

    const directory = users
      .filter((u) => !blockedMe.has(u.id))
      .map((u) => ({ ...u, blockedByMe: blockedByMe.has(u.id) }));

    return json(directory);
  } catch (error) {
    return handleError('GET /api/chat/directory', error);
  }
}
