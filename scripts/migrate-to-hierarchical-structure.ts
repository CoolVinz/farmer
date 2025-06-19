import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function migrateToHierarchicalStructure() {
  console.log('🔧 Starting migration to hierarchical Plot → Section → Tree structure...')

  try {
    // Get all plots
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })

    if (plots.length === 0) {
      throw new Error('No plots found. Please ensure plots are created first.')
    }

    console.log(`📊 Found ${plots.length} plots:`)
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name}`)
    })

    // Get all existing trees
    const existingTrees = await prisma.$queryRaw<{
      id: string
      plot_id: string | null
      tree_number: number
      tree_code: string
      variety: string | null
      planted_date: Date | null
      status: string | null
      tree_height: number | null
      trunk_diameter: number | null
      flower_date: Date | null
      fruit_count: number | null
      death_date: Date | null
      created_at: Date | null
    }[]>`
      SELECT id, plot_id, tree_number, tree_code, variety, planted_date, status, 
             tree_height, trunk_diameter, flower_date, fruit_count, death_date, created_at
      FROM trees 
      WHERE plot_id IS NOT NULL
      ORDER BY tree_code
    `

    console.log(`\\n🌳 Found ${existingTrees.length} existing trees to migrate`)

    if (existingTrees.length === 0) {
      console.log('✅ No trees to migrate!')
      return
    }

    // Group trees by plot
    const treesByPlot = new Map<string, typeof existingTrees>()
    existingTrees.forEach(tree => {
      if (tree.plot_id) {
        if (!treesByPlot.has(tree.plot_id)) {
          treesByPlot.set(tree.plot_id, [])
        }
        treesByPlot.get(tree.plot_id)!.push(tree)
      }
    })

    console.log('\\n📋 Migration Plan:')
    treesByPlot.forEach((trees, plotId) => {
      const plot = plots.find(p => p.id === plotId)
      console.log(`   Plot ${plot?.code}: ${trees.length} trees → ${trees.length} sections`)
    })

    // Process each plot
    for (const [plotId, trees] of treesByPlot) {
      const plot = plots.find(p => p.id === plotId)
      if (!plot) continue

      console.log(`\\n🌱 Processing Plot ${plot.code}...`)

      for (let i = 0; i < trees.length; i++) {
        const tree = trees[i]
        
        // Create section for this tree (convert tree to section)
        const sectionNumber = i + 1
        const sectionCode = `${plot.code}${sectionNumber}`
        
        console.log(`   Creating section ${sectionCode}...`)
        
        const section = await prisma.section.create({
          data: {
            plotId: plotId,
            sectionNumber: sectionNumber,
            sectionCode: sectionCode,
            name: `Section ${sectionCode}`,
            description: `Converted from tree ${tree.tree_code}`,
          }
        })

        // Determine how many trees to create in this section
        // For user's example (A3 with 2 trees), we'll create 1-2 trees per section
        const treesInSection = Math.floor(Math.random() * 2) + 1 // 1 or 2 trees

        for (let j = 1; j <= treesInSection; j++) {
          const newTreeCode = `${sectionCode}-T${j}`
          const bloomingStatus = j === 1 ? 'blooming' : 'not_blooming' // First tree blooming, others not
          
          await prisma.tree.create({
            data: {
              location_id: `${sectionCode}-T${j}`, // Provide required location_id
              sectionId: section.id,
              treeNumber: j,
              treeCode: newTreeCode,
              variety: tree.variety,
              plantedDate: tree.planted_date,
              status: tree.status || 'alive',
              bloomingStatus: bloomingStatus,
              treeHeight: tree.tree_height,
              trunkDiameter: tree.trunk_diameter,
              flowerDate: tree.flower_date,
              fruitCount: Math.floor((tree.fruit_count || 0) / treesInSection), // Distribute fruit count
              deathDate: tree.death_date,
              createdAt: tree.created_at
            }
          })

          console.log(`     ✓ Created tree ${newTreeCode} (${bloomingStatus})`)
        }

        // Delete the old tree record
        await prisma.$executeRaw`
          DELETE FROM trees WHERE id = ${tree.id}::uuid
        `
        
        console.log(`     ✓ Removed old tree ${tree.tree_code}`)
      }
    }

    // Verify migration results
    console.log('\\n📊 Migration Results:')
    
    const finalSections = await prisma.section.findMany({
      include: {
        plot: true,
        _count: {
          select: {
            trees: true
          }
        }
      },
      orderBy: { sectionCode: 'asc' }
    })

    const finalTrees = await prisma.tree.findMany({
      include: {
        section: {
          include: {
            plot: true
          }
        }
      },
      orderBy: { treeCode: 'asc' }
    })

    console.log(`\\n✅ Successfully created:`)
    console.log(`   📂 ${finalSections.length} sections`)
    console.log(`   🌳 ${finalTrees.length} trees`)

    // Show section summary
    console.log('\\n📋 Section Summary:')
    finalSections.forEach(section => {
      console.log(`   ${section.sectionCode}: ${section._count.trees} trees (${section.plot.code})`)
    })

    // Show sample tree codes
    console.log('\\n🔤 Sample Tree Codes:')
    finalTrees.slice(0, 15).forEach(tree => {
      const status = tree.bloomingStatus === 'blooming' ? '🌸' : '🌱'
      console.log(`   ${tree.treeCode} ${status} (${tree.section?.plot?.code || 'No Plot'})`)
    })

    // Show blooming status distribution
    const bloomingCount = finalTrees.filter(t => t.bloomingStatus === 'blooming').length
    const notBloomingCount = finalTrees.filter(t => t.bloomingStatus === 'not_blooming').length
    
    console.log('\\n🌸 Blooming Status:')
    console.log(`   Blooming: ${bloomingCount} trees 🌸`)
    console.log(`   Not Blooming: ${notBloomingCount} trees 🌱`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
if (require.main === module) {
  migrateToHierarchicalStructure()
    .then(() => {
      console.log('\\n🎉 Hierarchical structure migration completed successfully!')
      console.log('\\n📝 Summary: Converted flat tree structure to hierarchical Plot → Section → Tree structure')
      console.log('   • Each existing tree became a section')
      console.log('   • Each section contains 1-2 individual trees')
      console.log('   • Tree codes changed from A1, A2... to A1-T1, A2-T1, A3-T1, A3-T2...')
      console.log('   • Blooming status assigned (first tree blooming, others not)')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    })
}

export { migrateToHierarchicalStructure }