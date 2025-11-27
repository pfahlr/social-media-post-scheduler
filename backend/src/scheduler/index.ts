import cron from 'node-cron';
import { loadEnv } from '../config/env';
import { runDispatchScheduledPostsJob } from './jobs/dispatchScheduledPosts';
import { runCleanupOldPostsJob } from './jobs/cleanupOldPosts';

export function initScheduler() {
  const env = loadEnv();

  if (process.env.ENABLE_SCHEDULER === 'false') {
    // eslint-disable-next-line no-console
    console.log('Scheduler disabled by ENABLE_SCHEDULER=false');
    return;
  }

  const intervalSeconds = env.SCHEDULER_INTERVAL_SECONDS;
  const step = Math.max(1, Math.min(intervalSeconds, 59));

  cron.schedule(`*/${step} * * * * *`, async () => {
    await runDispatchScheduledPostsJob();
  });

  cron.schedule('0 0 * * *', async () => {
    await runCleanupOldPostsJob();
  });

  // eslint-disable-next-line no-console
  console.log('Scheduler initialized');
}
