/**
 * Prisma Client - Server Only
 * 
 * This module should ONLY be imported in:
 * - Server Components
 * - Server Actions (files with "use server")
 * - API Routes
 * 
 * NEVER import this in Client Components ("use client")
 */
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import '@/lib/config/timezone' // Initialize timezone early

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create adapter using DATABASE_URL connection string
// PrismaMariaDb works with both MariaDB and MySQL databases
// Note: MySQL/MariaDB timezone is set via --default-time-zone='+07:00' in docker-compose
let adapter: PrismaMariaDb | undefined

// Only create adapter if DATABASE_URL is available and valid
// This prevents errors during build time when the database isn't accessible
if (process.env.DATABASE_URL && typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.trim() !== '') {
  try {
    adapter = new PrismaMariaDb(process.env.DATABASE_URL)
  } catch (error) {
    // If adapter creation fails (e.g., during build), we'll create PrismaClient without adapter
    // Prisma will fall back to using the connection string directly
    console.warn('Failed to create PrismaMariaDb adapter, using default connection:', error)
    adapter = undefined
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(adapter ? { adapter } : {}),
    log: [],
    errorFormat: 'minimal',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

