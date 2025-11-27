import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';

const router = Router();

// GET /api/scheduled-posts
router.get('/', authRequired, async (_req, res) => {
  // TODO: list scheduled posts for current user
  return res.status(501).json({ error: 'Not implemented' });
});

// GET /api/scheduled-posts/:id
router.get('/:id', authRequired, async (_req, res) => {
  // TODO: fetch single scheduled post
  return res.status(501).json({ error: 'Not implemented' });
});

// POST /api/scheduled-posts
router.post('/', authRequired, async (_req, res) => {
  // TODO: create scheduled post from draft (immediate or future)
  return res.status(501).json({ error: 'Not implemented' });
});

// POST /api/scheduled-posts/:id/cancel
router.post('/:id/cancel', authRequired, async (_req, res) => {
  // TODO: cancel scheduled post
  return res.status(501).json({ error: 'Not implemented' });
});

export default router;
