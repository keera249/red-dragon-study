import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  if (process.env.VERCEL) {
    const tmpPath = '/tmp/dev.db';
    if (!fs.existsSync(tmpPath)) {
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.resolve('./prisma/dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpPath);
            break;
          } catch (e) {
            console.error('Failed copying sqlite to /tmp:', e);
          }
        }
      }
    }
    if (fs.existsSync(tmpPath)) {
      return `file:${tmpPath}`;
    }
  }

  if (envUrl && envUrl.startsWith('file:')) {
    const relativePath = envUrl.replace('file:', '');
    if (relativePath.startsWith('./')) {
      const absPath = path.resolve(process.cwd(), 'prisma', relativePath.replace('./', '')).replace(/\\/g, '/');
      if (fs.existsSync(absPath)) {
        return `file:${absPath}`;
      }
    }
    return envUrl;
  }

  const defaultAbsPath = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  return `file:${defaultAbsPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
