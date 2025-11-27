import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: './prisma/migrations',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
