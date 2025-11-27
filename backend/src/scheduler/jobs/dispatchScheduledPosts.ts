import { prisma } from '../../db/client';
import { getProvider } from '../../providers/registry';
import { loadEnv } from '../../config/env';

export async function runDispatchScheduledPostsJob(): Promise<void> {
  const env = loadEnv();
  const now = new Date();

  // TODO: refine query to include publishImmediately flag per spec
  const scheduledPosts = await prisma.scheduledPost.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now }
    },
    include: {
      postDraft: true,
      postTargets: {
        include: {
          socialAccount: true
        }
      }
    }
  });

  for (const scheduled of scheduledPosts) {
    // TODO: set status to PROCESSING with optimistic concurrency
    for (const target of scheduled.postTargets) {
      const provider = getProvider(target.providerId);
      if (!provider) {
        // TODO: mark as failed with error
        continue;
      }

      const attempts = await prisma.deliveryAttempt.count({
        where: { postTargetId: target.id }
      });

      const maxRetries =
        provider.capabilities.retryConfig?.maxRetries ?? env.DEFAULT_MAX_RETRIES;

      if (attempts >= maxRetries) {
        // TODO: mark PostTarget as FAILED
        continue;
      }

      // TODO: create DeliveryAttempt, call provider.publishPost, update statuses
    }

    // TODO: update ScheduledPost status based on PostTarget statuses
  }
}
