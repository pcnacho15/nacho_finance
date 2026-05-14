import { prisma } from '@/lib/prisma';

// Conversations store the user pair sorted, so (A,B) and (B,A) map to one row.
export function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function isBlockedBetween(userA: string, userB: string): Promise<boolean> {
  const block = await prisma.chatBlock.findFirst({
    where: {
      OR: [
        { blockerId: userA, blockedId: userB },
        { blockerId: userB, blockedId: userA },
      ],
    },
  });
  return block !== null;
}
