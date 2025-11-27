import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const db = new Database(process.env.DATABASE_URL?.replace('file:', '') || './dev.db');
const adapter = new PrismaBetterSqlite3(db);

export const prisma = new PrismaClient({ adapter });
