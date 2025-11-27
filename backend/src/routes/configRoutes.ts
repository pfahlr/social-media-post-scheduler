import { Router } from 'express';
import { loadEnv } from '../config/env';

const router = Router();

// GET /api/config
router.get('/', async (_req, res) => {
  const env = loadEnv();
  // Expose only safe, non-secret config values
  return res.json({
    postRetentionDays: env.POST_RETENTION_DAYS,
    schedulerIntervalSeconds: env.SCHEDULER_INTERVAL_SECONDS,
    defaultMaxRetries: env.DEFAULT_MAX_RETRIES
  });
});

export default router;
