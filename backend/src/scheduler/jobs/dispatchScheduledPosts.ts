import { prisma } from '../../db/client';
import { getProvider } from '../../providers/registry';
import { loadEnv } from '../../config/env';

export async function runDispatchScheduledPostsJob(): Promise<void> {
  const env = loadEnv();
  const now = new Date();

  try {
    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now }
      },
      include: {
        postDraft: true,
        postTargets: {
          where: {
            status: { in: ['pending', 'failed'] }
          },
          include: {
            socialAccount: true,
            deliveryAttempts: true
          }
        }
      }
    });

    for (const scheduled of scheduledPosts) {
      await prisma.scheduledPost.update({
        where: { id: scheduled.id },
        data: { status: 'processing' }
      });

      const targetResults: Array<{ targetId: string; success: boolean }> = [];

      for (const target of scheduled.postTargets) {
        const provider = getProvider(target.providerId);
        if (!provider) {
          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              status: 'failed',
              errorMessage: `Provider ${target.providerId} not found`
            }
          });
          await prisma.deliveryAttempt.create({
            data: {
              postTargetId: target.id,
              result: 'failure',
              errorMessage: `Provider ${target.providerId} not found`
            }
          });
          targetResults.push({ targetId: target.id, success: false });
          continue;
        }

        const attempts = target.deliveryAttempts.length;
        const maxRetries =
          provider.capabilities.retryConfig?.maxRetries ?? env.DEFAULT_MAX_RETRIES;

        if (attempts >= maxRetries) {
          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              status: 'failed',
              errorMessage: `Max retries (${maxRetries}) exceeded`
            }
          });
          targetResults.push({ targetId: target.id, success: false });
          continue;
        }

        try {
          const normalizedPost = provider.normalizePostInput({
            title: scheduled.postDraft.title,
            bodyText: scheduled.postDraft.bodyText,
            postType: scheduled.postDraft.postType,
            mediaAssetIds: scheduled.postDraft.mediaAssetIds as string[]
          });

          const result = await provider.publishPost(
            {
              id: target.socialAccount.id,
              providerId: target.socialAccount.providerId,
              instanceUrl: target.socialAccount.instanceUrl,
              authData: target.socialAccount.authData as Record<string, unknown>
            },
            normalizedPost
          );

          if (result.success) {
            await prisma.postTarget.update({
              where: { id: target.id },
              data: { status: 'success', errorMessage: null }
            });
            await prisma.deliveryAttempt.create({
              data: {
                postTargetId: target.id,
                result: 'success',
                providerResponse: result.rawResponse || {}
              }
            });
            targetResults.push({ targetId: target.id, success: true });
          } else {
            const errorMessage = result.errorMessage || 'Unknown error';
            const newAttempts = attempts + 1;
            const isFinal = newAttempts >= maxRetries;

            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: isFinal ? 'failed' : 'pending',
                errorMessage
              }
            });
            await prisma.deliveryAttempt.create({
              data: {
                postTargetId: target.id,
                result: 'failure',
                errorMessage,
                providerResponse: result.rawResponse || {}
              }
            });
            targetResults.push({ targetId: target.id, success: false });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          const newAttempts = attempts + 1;
          const isFinal = newAttempts >= maxRetries;

          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              status: isFinal ? 'failed' : 'pending',
              errorMessage
            }
          });
          await prisma.deliveryAttempt.create({
            data: {
              postTargetId: target.id,
              result: 'failure',
              errorMessage
            }
          });
          targetResults.push({ targetId: target.id, success: false });
        }
      }

      const allSuccess = targetResults.every(r => r.success);
      const anyPending = targetResults.some(r => !r.success);
      const finalStatus = allSuccess ? 'completed' : anyPending ? 'failed' : 'failed';

      await prisma.scheduledPost.update({
        where: { id: scheduled.id },
        data: { status: finalStatus }
      });
    }
  } catch (err) {
    console.error('Error in dispatchScheduledPostsJob:', err);
  }
}
