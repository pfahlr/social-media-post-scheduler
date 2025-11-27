import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';
import { prisma } from '../db/client';
import type { UserSession } from '../auth/types';

const router = Router();

// GET /api/drafts
router.get('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const drafts = await prisma.postDraft.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });
    return res.json({ drafts });
  } catch (err) {
    next(err);
  }
});

// GET /api/drafts/:id
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const draft = await prisma.postDraft.findUnique({
      where: { id }
    });

    if (!draft || draft.userId !== user.id) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    return res.json(draft);
  } catch (err) {
    next(err);
  }
});

// POST /api/drafts
router.post('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { title, bodyText, postType, mediaAssetIds } = req.body as {
      title?: string | null;
      bodyText: string;
      postType: string;
      mediaAssetIds?: string[];
    };

    const draft = await prisma.postDraft.create({
      data: {
        userId: user.id,
        title,
        bodyText,
        postType,
        mediaAssetIds: mediaAssetIds || []
      }
    });

    return res.status(201).json(draft);
  } catch (err) {
    next(err);
  }
});

// PUT /api/drafts/:id
router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;
    const { title, bodyText, postType, mediaAssetIds } = req.body as {
      title?: string | null;
      bodyText?: string;
      postType?: string;
      mediaAssetIds?: string[];
    };

    const existing = await prisma.postDraft.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const updated = await prisma.postDraft.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(bodyText !== undefined && { bodyText }),
        ...(postType !== undefined && { postType }),
        ...(mediaAssetIds !== undefined && { mediaAssetIds })
      }
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/drafts/:id/clone
router.post('/:id/clone', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const original = await prisma.postDraft.findUnique({
      where: { id }
    });

    if (!original || original.userId !== user.id) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    const cloned = await prisma.postDraft.create({
      data: {
        userId: user.id,
        title: original.title,
        bodyText: original.bodyText,
        postType: original.postType,
        mediaAssetIds: original.mediaAssetIds
      }
    });

    return res.status(201).json(cloned);
  } catch (err) {
    next(err);
  }
});

export default router;
