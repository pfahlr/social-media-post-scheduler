import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';
import { prisma } from '../db/client';
import type { UserSession } from '../auth/types';

const router = Router();

// POST /api/media
router.post('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { mimeType, data } = req.body as {
      mimeType: string;
      data: string;
    };

    if (!data || !mimeType) {
      return res.status(400).json({ error: 'Missing mimeType or data' });
    }

    const dataBuffer = Buffer.from(data, 'base64');
    const sizeBytes = dataBuffer.length;

    const media = await prisma.mediaAsset.create({
      data: {
        userId: user.id,
        mimeType,
        sizeBytes,
        dataBlob: dataBuffer
      }
    });

    return res.status(201).json({
      id: media.id,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      createdAt: media.createdAt
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/media/:id
router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const media = await prisma.mediaAsset.findUnique({
      where: { id }
    });

    if (!media || media.userId !== user.id) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', media.sizeBytes);
    return res.send(media.dataBlob);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/media/:id
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const media = await prisma.mediaAsset.findUnique({
      where: { id }
    });

    if (!media || media.userId !== user.id) {
      return res.status(404).json({ error: 'Media not found' });
    }

    await prisma.mediaAsset.delete({
      where: { id }
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
