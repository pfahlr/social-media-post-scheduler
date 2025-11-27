import http from 'http';
import { app } from './app';
import { initScheduler } from './scheduler';
import { loadEnv } from './config/env';

async function main() {
  const env = loadEnv();

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });

  initScheduler();
}

void main();
