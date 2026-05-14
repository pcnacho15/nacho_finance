import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

// Single-region app (Colombia): pin both the Node process and the Postgres
// connection to one timezone so `timestamp` columns store and read as local
// wall-clock consistently — otherwise `now()` and date inputs drift by the UTC
// offset between the DB session and the browser.
const APP_TZ = process.env.TZ || 'America/Bogota';
process.env.TZ = APP_TZ;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    options: `-c timezone=${APP_TZ}`,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
