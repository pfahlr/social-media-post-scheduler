import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';

const router = Router();

// GET /api/social-accounts
router.get('/', authRequired, async (_req, res) => {
  // TODO: implement listing social accounts for current user
  return res.status(501).json({ error: 'Not implemented' });
});

// POST /api/social-accounts
router.post('/', authRequired, async (_req, res) => {
  // TODO: implement adding a new social account (provider-specific payload)
  return res.status(501).json({ error: 'Not implemented' });
});

// PUT /api/social-accounts/:id
router.put('/:id', authRequired, async (_req, res) => {
  // TODO: implement updating display_name/handle/instanceUrl
  return res.status(501).json({ error: 'Not implemented' });
});

// DELETE /api/social-accounts/:id
router.delete('/:id', authRequired, async (_req, res) => {
  // TODO: implement deleting a social account
  return res.status(501).json({ error: 'Not implemented' });
});

export default router;
