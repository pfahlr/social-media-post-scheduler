import { prisma } from '../../db/client';

export async function runCleanupOldPostsJob(): Promise<void> {
  const now = new Date();

  try {
    const oldPosts = await prisma.scheduledPost.findMany({
      where: {
        retentionUntil: { lte: now }
      },
      include: {
        postTargets: {
          include: {
            deliveryAttempts: true
          }
        }
      }
    });

    for (const post of oldPosts) {
      for (const target of post.postTargets) {
        await prisma.deliveryAttempt.deleteMany({
          where: { postTargetId: target.id }
        });
      }

      await prisma.postTarget.deleteMany({
        where: { scheduledPostId: post.id }
      });

      await prisma.scheduledPost.delete({
        where: { id: post.id }
      });
    }

    const orphanedDrafts = await prisma.postDraft.findMany({
      where: {
        scheduledPosts: {
          none: {}
        }
      }
    });

    for (const draft of orphanedDrafts) {
      for (const mediaId of draft.mediaAssetIds as string[]) {
        const isUsedByOtherDrafts = await prisma.postDraft.count({
          where: {
            id: { not: draft.id },
            mediaAssetIds: {
              has: mediaId
            }
          }
        });

        if (isUsedByOtherDrafts === 0) {
          await prisma.mediaAsset.deleteMany({
            where: { id: mediaId }
          });
        }
      }
    }

    console.log(`Cleaned up ${oldPosts.length} old posts`);
  } catch (err) {
    console.error('Error in cleanupOldPostsJob:', err);
  }
}
