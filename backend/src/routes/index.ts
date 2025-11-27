import type { Express } from 'express';
import authRoutes from './authRoutes';
import socialAccountRoutes from './socialAccountRoutes';
import draftRoutes from './draftRoutes';
import mediaRoutes from './mediaRoutes';
import scheduledPostRoutes from './scheduledPostRoutes';
import configRoutes from './configRoutes';

export function registerRoutes(app: Express) {
  app.use('/api/auth', authRoutes);
  app.use('/api/social-accounts', socialAccountRoutes);
  app.use('/api/drafts', draftRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/scheduled-posts', scheduledPostRoutes);
  app.use('/api/config', configRoutes);
}
