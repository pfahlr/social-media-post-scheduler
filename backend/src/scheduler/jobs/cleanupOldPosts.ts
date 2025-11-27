import { prisma } from '../../db/client';

export async function runCleanupOldPostsJob(): Promise<void> {
  const now = new Date();

  const toDelete = await prisma.scheduledPost.findMany({
    where: {
      retentionUntil: { lte: now }
    },
    select: { id: true }
  });

  if (!toDelete.length) return;

  const ids = toDelete.map(p => p.id);

  // TODO: implement cascaded deletion using Prisma or explicit deletes
  // eslint-disable-next-line no-console
  console.log('Cleanup job would delete ScheduledPosts:', ids);
}
