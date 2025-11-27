import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';

const router = Router();

// GET /api/drafts
router.get('/', authRequired, async (_req, res) => {
  // TODO: list drafts for current user
  return res.status(501).json({ error: 'Not implemented' });
});

// GET /api/drafts/:id
router.get('/:id', authRequired, async (_req, res) => {
  // TODO: fetch single draft
  return res.status(501).json({ error: 'Not implemented' });
});

// POST /api/drafts
router.post('/', authRequired, async (_req, res) => {
  // TODO: create new draft
  return res.status(501).json({ error: 'Not implemented' });
});

// PUT /api/drafts/:id
router.put('/:id', authRequired, async (_req, res) => {
  // TODO: update draft
  return res.status(501).json({ error: 'Not implemented' });
});

// POST /api/drafts/:id/clone
router.post('/:id/clone', authRequired, async (_req, res) => {
  // TODO: clone draft
  return res.status(501).json({ error: 'Not implemented' });
});

export default router;
