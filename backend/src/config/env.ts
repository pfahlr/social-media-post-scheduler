export interface Env {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  SESSION_SECRET: string;
  POST_RETENTION_DAYS: number;
  SCHEDULER_INTERVAL_SECONDS: number;
  DEFAULT_MAX_RETRIES: number;
  CORS_ORIGIN: string;
}

export function loadEnv(): Env {
  return {
    NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) ?? 'development',
    PORT: Number(process.env.PORT ?? 3000),
    DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
    SESSION_SECRET: process.env.SESSION_SECRET ?? 'change-me',
    POST_RETENTION_DAYS: Number(process.env.POST_RETENTION_DAYS ?? 30),
    SCHEDULER_INTERVAL_SECONDS: Number(process.env.SCHEDULER_INTERVAL_SECONDS ?? 60),
    DEFAULT_MAX_RETRIES: Number(process.env.DEFAULT_MAX_RETRIES ?? 3),
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173'
  };
}
