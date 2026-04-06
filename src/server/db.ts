/**
 * Database utilities for Creator Hive
 * 
 * This file provides a singleton Prisma client instance
 * to prevent multiple instances in development (hot reload)
 * and ensure proper connection pooling in production.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/** Alias for `db` — some routes import `prisma` by convention */
export const prisma = db

/**
 * Helper function to safely handle database errors
 */
export function handleDatabaseError(error: unknown): {
  message: string
  code?: string
  statusCode: number
} {
  if (error instanceof Error) {
    // Prisma-specific errors
    if ('code' in error) {
      const prismaError = error as { code: string; meta?: unknown }
      
      switch (prismaError.code) {
        case 'P2002':
          return {
            message: 'A record with this value already exists',
            code: prismaError.code,
            statusCode: 409,
          }
        case 'P2025':
          return {
            message: 'Record not found',
            code: prismaError.code,
            statusCode: 404,
          }
        case 'P2003':
          return {
            message: 'Foreign key constraint failed',
            code: prismaError.code,
            statusCode: 400,
          }
        default:
          return {
            message: error.message || 'Database error occurred',
            code: prismaError.code,
            statusCode: 500,
          }
      }
    }
    
    return {
      message: error.message || 'An unexpected error occurred',
      statusCode: 500,
    }
  }
  
  return {
    message: 'An unknown error occurred',
    statusCode: 500,
  }
}

/**
 * Type helper for Prisma transaction
 */
export type PrismaTransaction = Parameters<
  Parameters<typeof db.$transaction>[0]
>[0]


/**
 * Extended db client with explicit type assertions for models that may not
 * yet be reflected in the generated Prisma client (run `prisma generate` to update).
 * Used by routes that interact with CampaignFile, CampaignInvite, WalletTransaction.
 */
export const dbExt = db as unknown as typeof db & {
  campaignFile: typeof db.campaignFile & {
    findMany: (args?: unknown) => Promise<unknown[]>;
    findUnique: (args?: unknown) => Promise<unknown>;
    create: (args?: unknown) => Promise<unknown>;
    update: (args?: unknown) => Promise<unknown>;
    delete: (args?: unknown) => Promise<unknown>;
  };
  campaignInvite: typeof db.campaignInvite & {
    findMany: (args?: unknown) => Promise<unknown[]>;
    findUnique: (args?: unknown) => Promise<unknown>;
    upsert: (args?: unknown) => Promise<unknown>;
    create: (args?: unknown) => Promise<unknown>;
    update: (args?: unknown) => Promise<unknown>;
    delete: (args?: unknown) => Promise<unknown>;
  };
  walletTransaction: typeof db.walletTransaction & {
    findMany: (args?: unknown) => Promise<unknown[]>;
    findUnique: (args?: unknown) => Promise<unknown>;
    create: (args?: unknown) => Promise<unknown>;
    update: (args?: unknown) => Promise<unknown>;
  };
};
