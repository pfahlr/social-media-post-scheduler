import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';
import { prisma } from '../db/client';
import { getProvider } from '../providers/registry';
import { loadEnv } from '../config/env';
import type { UserSession } from '../auth/types';

const router = Router();

// GET /api/scheduled-posts
router.get('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const posts = await prisma.scheduledPost.findMany({
      where: { userId: user.id },
      include: {
        postDraft: true,
        postTargets: {
          include: {
            socialAccount: {
              select: {
                id: true,
                providerId: true,
                displayName: true,
                handle: true
              }
            }
          }
        }
      },
      orderBy: { scheduledFor: 'asc' }
    });
    return res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// GET /api/scheduled-posts/:id
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const post = await prisma.scheduledPost.findUnique({
      where: { id },
      include: {
        postDraft: true,
        postTargets: {
          include: {
            socialAccount: {
              select: {
                id: true,
                providerId: true,
                displayName: true,
                handle: true
              }
            },
            deliveryAttempts: {
              orderBy: { attemptedAt: 'desc' }
            }
          }
        }
      }
    });

    if (!post || post.userId !== user.id) {
      return res.status(404).json({ error: 'Scheduled post not found' });
    }

    return res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/scheduled-posts
router.post('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const env = loadEnv();
    const { postDraftId, scheduledFor, publishImmediately, targets } = req.body as {
      postDraftId: string;
      scheduledFor?: string;
      publishImmediately?: boolean;
      targets: Array<{
        socialAccountId: string;
        providerId: string;
      }>;
    };

    const draft = await prisma.postDraft.findUnique({
      where: { id: postDraftId }
    });

    if (!draft || draft.userId !== user.id) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    if (!targets || targets.length === 0) {
      return res.status(400).json({ error: 'At least one target is required' });
    }

    const scheduledForDate = publishImmediately
      ? new Date()
      : scheduledFor
        ? new Date(scheduledFor)
        : new Date();

    const retentionUntil = new Date(scheduledForDate);
    retentionUntil.setDate(retentionUntil.getDate() + env.POST_RETENTION_DAYS);

    const scheduledPost = await prisma.scheduledPost.create({
      data: {
        userId: user.id,
        postDraftId,
        scheduledFor: scheduledForDate,
        publishImmediately: publishImmediately || false,
        status: 'pending',
        retentionUntil,
        postTargets: {
          create: targets.map(target => {
            const provider = getProvider(target.providerId);
            const effectiveConstraints = provider?.capabilities || {};

            return {
              providerId: target.providerId,
              socialAccountId: target.socialAccountId,
              effectiveConstraints,
              status: 'pending'
            };
          })
        }
      },
      include: {
        postTargets: {
          include: {
            socialAccount: {
              select: {
                id: true,
                providerId: true,
                displayName: true,
                handle: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json(scheduledPost);
  } catch (err) {
    next(err);
  }
});

// POST /api/scheduled-posts/:id/cancel
router.post('/:id/cancel', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const post = await prisma.scheduledPost.findUnique({
      where: { id }
    });

    if (!post || post.userId !== user.id) {
      return res.status(404).json({ error: 'Scheduled post not found' });
    }

    if (post.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel post that is not pending' });
    }

    const updated = await prisma.scheduledPost.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
