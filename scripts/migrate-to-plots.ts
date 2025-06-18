import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function migrateToPlots() {
  console.log('🌱 Starting migration to plot structure...')

  try {
    // Step 1: Create the plots table and add plot_id to trees table
    console.log('📝 Creating plots table and updating trees table structure...')
    
    await prisma.$executeRaw`
      -- Create plots table
      CREATE TABLE IF NOT EXISTS plots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        area DECIMAL,
        soil_type VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP(6) DEFAULT NOW()
      );
    `

    await prisma.$executeRaw`
      -- Add new columns to trees table
      ALTER TABLE trees 
      ADD COLUMN IF NOT EXISTS plot_id UUID,
      ADD COLUMN IF NOT EXISTS tree_code VARCHAR(10) UNIQUE;
    `

    // Step 2: Insert default plots
    console.log('🏡 Creating garden plots A, B, C...')
    
    const plots = await prisma.$transaction([
      prisma.$executeRaw`
        INSERT INTO plots (code, name, description) 
        VALUES ('A', 'Garden Plot A', 'Main durian cultivation area - Plot A')
        ON CONFLICT (code) DO NOTHING
      `,
      prisma.$executeRaw`
        INSERT INTO plots (code, name, description) 
        VALUES ('B', 'Garden Plot B', 'Secondary durian cultivation area - Plot B')
        ON CONFLICT (code) DO NOTHING
      `,
      prisma.$executeRaw`
        INSERT INTO plots (code, name, description) 
        VALUES ('C', 'Garden Plot C', 'Tertiary durian cultivation area - Plot C')
        ON CONFLICT (code) DO NOTHING
      `
    ])

    // Step 3: Get the plot IDs
    const plotA = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM plots WHERE code = 'A'`
    const plotB = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM plots WHERE code = 'B'`
    const plotC = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM plots WHERE code = 'C'`

    if (!plotA[0] || !plotB[0] || !plotC[0]) {
      throw new Error('Failed to create or find plots')
    }

    // Step 4: Migrate existing tree data
    console.log('🌳 Migrating existing tree data to plot structure...')
    
    // Get all existing trees
    const existingTrees = await prisma.$queryRaw<{id: string, location_id: string, tree_number: number}[]>`
      SELECT id, location_id, tree_number FROM trees WHERE plot_id IS NULL
    `

    console.log(`Found ${existingTrees.length} trees to migrate`)

    // Group trees by plot based on their location_id pattern
    for (const tree of existingTrees) {
      let plotId: string
      let plotCode: string
      let treeNumber: number = tree.tree_number || 1

      // Determine plot based on location_id pattern
      const locationId = tree.location_id.toUpperCase()
      if (locationId.includes('A') || locationId.startsWith('A') || locationId.includes('PLOT_A')) {
        plotId = plotA[0].id
        plotCode = 'A'
      } else if (locationId.includes('B') || locationId.startsWith('B') || locationId.includes('PLOT_B')) {
        plotId = plotB[0].id
        plotCode = 'B'
      } else if (locationId.includes('C') || locationId.startsWith('C') || locationId.includes('PLOT_C')) {
        plotId = plotC[0].id
        plotCode = 'C'
      } else {
        // Default to plot A for unmatched trees
        plotId = plotA[0].id
        plotCode = 'A'
        console.warn(`⚠️  Tree ${tree.id} with location_id '${tree.location_id}' defaulted to Plot A`)
      }

      // Generate tree code
      const treeCode = `${plotCode}${treeNumber}`

      // Update the tree
      await prisma.$executeRaw`
        UPDATE trees 
        SET plot_id = ${plotId}::uuid, 
            tree_code = ${treeCode},
            tree_number = ${treeNumber}
        WHERE id = ${tree.id}::uuid
      `
    }

    // Step 5: Update batch_logs to reference plots properly
    console.log('📋 Updating batch logs to reference plots...')
    
    // Convert plot_id strings in batch_logs to actual plot UUIDs
    await prisma.$executeRaw`
      UPDATE batch_logs 
      SET plot_id = plots.id::text
      FROM plots 
      WHERE batch_logs.plot_id = plots.code
    `

    // Step 6: Add constraints and cleanup
    console.log('🔧 Adding constraints and cleaning up...')
    
    await prisma.$executeRaw`
      -- Make plot_id required in trees table
      ALTER TABLE trees 
      ALTER COLUMN plot_id SET NOT NULL;
    `

    await prisma.$executeRaw`
      -- Add foreign key constraints
      ALTER TABLE trees 
      ADD CONSTRAINT IF NOT EXISTS fk_trees_plot_id 
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE;
    `

    await prisma.$executeRaw`
      -- Add unique constraint for plot_id + tree_number
      ALTER TABLE trees 
      ADD CONSTRAINT IF NOT EXISTS unique_tree_per_plot 
      UNIQUE (plot_id, tree_number);
    `

    await prisma.$executeRaw`
      -- Update batch_logs foreign key to reference plots
      ALTER TABLE batch_logs 
      ALTER COLUMN plot_id TYPE UUID USING plot_id::uuid;
    `

    await prisma.$executeRaw`
      ALTER TABLE batch_logs 
      ADD CONSTRAINT IF NOT EXISTS fk_batch_logs_plot_id 
      FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE;
    `

    // Step 7: Remove old location_id column (optional - keep for now for safety)
    console.log('🧹 Migration completed successfully!')
    console.log('📊 Migration summary:')
    
    const plotStats = await prisma.$queryRaw<{plot_code: string, tree_count: number}[]>`
      SELECT p.code as plot_code, COUNT(t.id)::int as tree_count
      FROM plots p
      LEFT JOIN trees t ON t.plot_id = p.id
      GROUP BY p.code, p.name
      ORDER BY p.code
    `

    plotStats.forEach(stat => {
      console.log(`   Plot ${stat.plot_code}: ${stat.tree_count} trees`)
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
if (require.main === module) {
  migrateToPlots()
    .then(() => {
      console.log('✅ Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export { migrateToPlots }