import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function completeMigration() {
  console.log('🔧 Completing plot migration...')

  try {
    // Get all plots
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })

    if (plots.length === 0) {
      throw new Error('No plots found. Please run seed-plots.ts first.')
    }

    console.log(`📊 Found ${plots.length} plots:`)
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name}`)
    })

    // Get trees that need migration (without plot_id)
    const treesToMigrate = await prisma.$queryRaw<{
      id: string, 
      location_id: string, 
      tree_number: number
    }[]>`
      SELECT id, location_id, tree_number 
      FROM trees 
      WHERE plot_id IS NULL 
      ORDER BY location_id, tree_number
    `

    console.log(`\n🌳 Found ${treesToMigrate.length} trees to migrate`)

    if (treesToMigrate.length === 0) {
      console.log('✅ No trees need migration!')
      return
    }

    // Group trees by plot based on location_id and assign sequential numbers
    const plotTreeCounts = new Map<string, number>()
    
    // Initialize plot tree counts (including existing trees)
    for (const plot of plots) {
      const existingCount = await prisma.tree.count({
        where: { 
          section: {
            plotId: plot.id
          }
        }
      })
      plotTreeCounts.set(plot.id, existingCount)
    }

    // Process trees in batches
    let processed = 0
    const batchSize = 10

    for (let i = 0; i < treesToMigrate.length; i += batchSize) {
      const batch = treesToMigrate.slice(i, i + batchSize)
      
      for (const tree of batch) {
        let plotId: string
        let plotCode: string

        // Determine plot based on location_id pattern
        const locationId = tree.location_id.toUpperCase()
        if (locationId.includes('A') || locationId.startsWith('A') || locationId.includes('PLOT_A')) {
          plotId = plots.find(p => p.code === 'A')!.id
          plotCode = 'A'
        } else if (locationId.includes('B') || locationId.startsWith('B') || locationId.includes('PLOT_B')) {
          plotId = plots.find(p => p.code === 'B')!.id
          plotCode = 'B'
        } else if (locationId.includes('C') || locationId.startsWith('C') || locationId.includes('PLOT_C')) {
          plotId = plots.find(p => p.code === 'C')!.id
          plotCode = 'C'
        } else {
          // Default to plot A for unmatched trees, but distribute evenly
          const aTrees = plotTreeCounts.get(plots.find(p => p.code === 'A')!.id) || 0
          const bTrees = plotTreeCounts.get(plots.find(p => p.code === 'B')!.id) || 0
          const cTrees = plotTreeCounts.get(plots.find(p => p.code === 'C')!.id) || 0

          // Assign to plot with fewest trees
          if (aTrees <= bTrees && aTrees <= cTrees) {
            plotId = plots.find(p => p.code === 'A')!.id
            plotCode = 'A'
          } else if (bTrees <= cTrees) {
            plotId = plots.find(p => p.code === 'B')!.id
            plotCode = 'B'
          } else {
            plotId = plots.find(p => p.code === 'C')!.id
            plotCode = 'C'
          }
          
          console.log(`📍 Tree ${tree.id} (${tree.location_id}) assigned to Plot ${plotCode}`)
        }

        // Get next tree number for this plot
        const currentCount = plotTreeCounts.get(plotId) || 0
        const newTreeNumber = currentCount + 1
        const treeCode = `${plotCode}${newTreeNumber}`

        // Update tree with plot info
        await prisma.tree.update({
          where: { id: tree.id },
          data: {
            treeNumber: newTreeNumber,
            treeCode: treeCode
          }
        })

        // Update plot tree count
        plotTreeCounts.set(plotId, newTreeNumber)
        processed++

        console.log(`✓ ${tree.id} → ${treeCode} (${processed}/${treesToMigrate.length})`)
      }
    }

    // Update batch_logs to reference plots properly
    console.log('\n📋 Updating batch logs...')
    
    // Convert string plot_ids to UUIDs where needed
    const plotIdMappings = new Map<string, string>()
    plots.forEach(plot => {
      plotIdMappings.set(plot.code, plot.id)
      plotIdMappings.set(plot.code.toLowerCase(), plot.id)
      plotIdMappings.set(`plot_${plot.code.toLowerCase()}`, plot.id)
      plotIdMappings.set(`plot${plot.code}`, plot.id)
    })

    const batchLogs = await prisma.$queryRaw<{id: string, plot_id: string}[]>`
      SELECT id, plot_id FROM batch_logs
    `

    for (const log of batchLogs) {
      const mappedPlotId = plotIdMappings.get(log.plot_id.toLowerCase())
      if (mappedPlotId && mappedPlotId !== log.plot_id) {
        await prisma.$executeRaw`
          UPDATE batch_logs 
          SET plot_id = ${mappedPlotId}::uuid 
          WHERE id = ${log.id}::uuid
        `
        console.log(`✓ Updated batch log ${log.id}: ${log.plot_id} → Plot ID`)
      }
    }

    console.log('\n✅ Migration completed successfully!')
    
    // Show final summary
    const finalSummary = await prisma.plot.findMany({
      include: {
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    console.log('\n📊 Final Plot Summary:')
    finalSummary.forEach(plot => {
      console.log(`   Plot ${plot.code}: ${plot._count.sections} sections`)
    })

    // Show sample tree codes
    const sampleTrees = await prisma.tree.findMany({
      take: 15,
      include: {
        section: {
          include: {
            plot: true
          }
        }
      },
      orderBy: { treeCode: 'asc' }
    })

    console.log('\n🔤 Sample Tree Codes:')
    sampleTrees.forEach(tree => {
      console.log(`   ${tree.treeCode} (${tree.section?.plot?.name})`)
    })

  } catch (error) {
    console.error('❌ Migration completion failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration completion
if (require.main === module) {
  completeMigration()
    .then(() => {
      console.log('\n🎉 Migration completion successful!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration completion failed:', error)
      process.exit(1)
    })
}

export { completeMigration }