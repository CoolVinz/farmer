// Development script to check database schema
import { checkDatabaseSchema } from '../lib/schema-check'

async function main() {
  console.log('🔍 Starting database schema check...')
  
  try {
    await checkDatabaseSchema()
    console.log('\n✅ Schema check completed!')
  } catch (error) {
    console.error('❌ Schema check failed:', error)
    process.exit(1)
  }
}

main()