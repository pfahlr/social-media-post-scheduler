import { Router } from 'express';
import { authRequired } from '../middleware/authRequired';
import { prisma } from '../db/client';
import { getProvider, listProviders } from '../providers/registry';
import type { UserSession } from '../auth/types';

const router = Router();

// GET /api/social-accounts/providers
router.get('/providers', authRequired, async (_req, res, next) => {
  try {
    const providers = listProviders();
    const providersInfo = providers.map(p => ({
      id: p.id,
      label: p.label,
      capabilities: p.capabilities
    }));
    return res.json({ providers: providersInfo });
  } catch (err) {
    next(err);
  }
});

// GET /api/social-accounts
router.get('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        providerId: true,
        displayName: true,
        handle: true,
        instanceUrl: true,
        createdAt: true,
        updatedAt: true,
        lastValidatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ accounts });
  } catch (err) {
    next(err);
  }
});

// POST /api/social-accounts
router.post('/', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { providerId, displayName, handle, instanceUrl, authData } = req.body as {
      providerId: string;
      displayName: string;
      handle: string;
      instanceUrl?: string | null;
      authData: Record<string, unknown>;
    };

    const provider = getProvider(providerId);
    if (!provider) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const isValid = await provider.validateAuth(authData);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid authentication credentials' });
    }

    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        providerId,
        displayName,
        handle,
        instanceUrl,
        authData,
        lastValidatedAt: new Date()
      }
    });

    return res.status(201).json({
      id: account.id,
      providerId: account.providerId,
      displayName: account.displayName,
      handle: account.handle,
      instanceUrl: account.instanceUrl,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      lastValidatedAt: account.lastValidatedAt
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/social-accounts/:id
router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;
    const { displayName, handle, instanceUrl } = req.body as {
      displayName?: string;
      handle?: string;
      instanceUrl?: string | null;
    };

    const existing = await prisma.socialAccount.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const updated = await prisma.socialAccount.update({
      where: { id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(handle !== undefined && { handle }),
        ...(instanceUrl !== undefined && { instanceUrl })
      }
    });

    return res.json({
      id: updated.id,
      providerId: updated.providerId,
      displayName: updated.displayName,
      handle: updated.handle,
      instanceUrl: updated.instanceUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      lastValidatedAt: updated.lastValidatedAt
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/social-accounts/:id
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const user = req.user as UserSession;
    const { id } = req.params;

    const existing = await prisma.socialAccount.findUnique({
      where: { id }
    });

    if (!existing || existing.userId !== user.id) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await prisma.socialAccount.delete({
      where: { id }
    });

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
