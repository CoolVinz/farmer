import { PrismaClient } from '@/lib/generated/prisma';

export async function checkDatabaseConnection(): Promise<{
  success: boolean;
  environment: string;
  database: string;
  error?: string;
}> {
  try {
    const prisma = new PrismaClient();
    
    // Try to connect and get basic info
    await prisma.$connect();
    
    // Get database URL info (without exposing credentials)
    const databaseUrl = process.env.DATABASE_URL || '';
    const isDev = databaseUrl.includes('82.180.137.92:5438');
    const isSupabase = databaseUrl.includes('supabase.com');
    
    let database = 'Unknown';
    if (isDev) {
      database = 'Development PostgreSQL';
    } else if (isSupabase) {
      database = 'Production Supabase';
    }
    
    await prisma.$disconnect();
    
    return {
      success: true,
      environment: process.env.NODE_ENV || 'development',
      database,
    };
  } catch (error) {
    return {
      success: false,
      environment: process.env.NODE_ENV || 'development',
      database: 'Connection Failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function getEnvironmentWarnings(): string[] {
  const warnings: string[] = [];
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL || '';
  
  // Check for environment mismatches
  if (nodeEnv === 'development' && databaseUrl.includes('supabase.com')) {
    warnings.push('🚨 Development mode connected to production database!');
  }
  
  if (nodeEnv === 'production' && databaseUrl.includes('82.180.137.92')) {
    warnings.push('⚠️ Production mode connected to development database!');
  }
  
  if (!databaseUrl) {
    warnings.push('❌ No database URL configured!');
  }
  
  return warnings;
}

export function isDevelopmentEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL || '';
  
  return (
    nodeEnv === 'development' &&
    databaseUrl.includes('82.180.137.92:5438')
  );
}

export function isProductionEnvironment(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const databaseUrl = process.env.DATABASE_URL || '';
  
  return (
    nodeEnv === 'production' &&
    databaseUrl.includes('supabase.com')
  );
}