import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with fallback for invalid DATABASE_URL during development
export const prisma = globalForPrisma.prisma ?? (() => {
  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://placeholder'
        }
      }
    })
  } catch (error) {
    console.warn('Prisma client initialization failed:', error)
    // Return a mock client that throws informative errors
    return new Proxy({}, {
      get() {
        throw new Error('Prisma client not properly configured. Please set DATABASE_URL with actual database password.')
      }
    }) as PrismaClient
  }
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma