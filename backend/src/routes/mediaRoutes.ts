import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';

const router = Router();

// POST /api/media
router.post('/', authRequired, async (_req, res) => {
  // TODO: handle media upload, store in MediaAsset
  return res.status(501).json({ error: 'Not implemented' });
});

// GET /api/media/:id
router.get('/:id', authRequired, async (_req, res) => {
  // TODO: stream or send media blob
  return res.status(501).json({ error: 'Not implemented' });
});

// DELETE /api/media/:id
router.delete('/:id', authRequired, async (_req, res) => {
  // TODO: delete media asset
  return res.status(501).json({ error: 'Not implemented' });
});

export default router;
