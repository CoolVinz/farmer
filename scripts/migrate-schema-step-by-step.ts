import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function migrateSchemaStepByStep() {
  console.log('🔧 Starting step-by-step schema migration...')

  try {
    // Step 1: Create sections table
    console.log('\\n📊 Step 1: Creating sections table...')
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
        section_number INTEGER NOT NULL,
        section_code VARCHAR UNIQUE NOT NULL,
        name VARCHAR,
        description TEXT,
        area DECIMAL,
        soil_type VARCHAR,
        created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(plot_id, section_number)
      )
    `
    
    console.log('✓ Sections table created')

    // Step 2: Add section_id column to trees as nullable
    console.log('\\n📊 Step 2: Adding section_id column to trees...')
    
    await prisma.$executeRaw`
      ALTER TABLE trees 
      ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE CASCADE
    `
    
    console.log('✓ section_id column added to trees')

    // Step 3: Add blooming_status column to trees
    console.log('\\n📊 Step 3: Adding blooming_status column to trees...')
    
    await prisma.$executeRaw`
      ALTER TABLE trees 
      ADD COLUMN IF NOT EXISTS blooming_status VARCHAR DEFAULT 'not_blooming'
    `
    
    console.log('✓ blooming_status column added to trees')

    // Step 4: Check current state
    console.log('\\n📊 Step 4: Checking current tree structure...')
    
    const currentTrees = await prisma.$queryRaw<{
      count: number
    }[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE plot_id IS NOT NULL
    `
    
    const treeCount = currentTrees[0]?.count || 0
    console.log(`✓ Found ${treeCount} trees with plot_id`)

    if (treeCount === 0) {
      console.log('✅ No trees to migrate - schema ready for new hierarchical structure')
      return
    }

    // Step 5: Get all plots for reference
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })

    console.log(`\\n📊 Step 5: Found ${plots.length} plots for migration`)
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name}`)
    })

    // Now the schema is ready for data migration
    console.log('\\n✅ Schema migration completed successfully!')
    console.log('📝 Database structure is now ready for hierarchical data migration')
    console.log('🔄 Next step: Run the data migration script to convert trees to sections')

  } catch (error) {
    console.error('❌ Schema migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run schema migration
if (require.main === module) {
  migrateSchemaStepByStep()
    .then(() => {
      console.log('\\n🎉 Schema migration completed!')
      console.log('\\n📋 What was done:')
      console.log('   ✓ Created sections table')
      console.log('   ✓ Added section_id column to trees (nullable)')
      console.log('   ✓ Added blooming_status column to trees')
      console.log('\\n🔄 Next: Run migrate-to-hierarchical-structure.ts to convert data')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Schema migration failed:', error)
      process.exit(1)
    })
}

export { migrateSchemaStepByStep }