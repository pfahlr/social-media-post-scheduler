import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { prisma } from '../db/client';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    // TODO: validate input properly
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash }
    });
    req.login({ id: user.id, email: user.email }, err => {
      if (err) return next(err);
      return res.json({ id: user.id, email: user.email });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ id: (req.user as any).id, email: (req.user as any).email });
});

router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.json({ ok: true });
  });
});

router.get('/me', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json(req.user);
});

export default router;
