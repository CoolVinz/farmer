import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function checkHierarchicalStatus() {
  console.log('🔍 Checking hierarchical structure status...')

  try {
    // Check plots
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })
    
    console.log(`\\n📊 Plots: ${plots.length}`)
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name}`)
    })

    // Check sections
    const sections = await prisma.section.findMany({
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
    
    console.log(`\\n📂 Sections: ${sections.length}`)
    if (sections.length > 0) {
      sections.forEach(section => {
        console.log(`   ${section.sectionCode}: ${section.name || 'No name'} (${section._count.trees} trees)`)
      })
    } else {
      console.log('   No sections found')
    }

    // Check trees with new structure
    const newTrees = await prisma.tree.findMany({
      where: {
        sectionId: {
          not: null
        }
      },
      include: {
        section: {
          include: {
            plot: true
          }
        }
      },
      orderBy: { treeCode: 'asc' }
    })

    console.log(`\\n🌳 Trees (new structure): ${newTrees.length}`)
    if (newTrees.length > 0) {
      console.log('\\n🔤 Sample tree codes (new):')
      newTrees.slice(0, 10).forEach(tree => {
        const status = tree.bloomingStatus === 'blooming' ? '🌸' : 
                      tree.bloomingStatus === 'budding' ? '🌿' : '🌱'
        console.log(`   ${tree.treeCode} ${status} (Section: ${tree.section.sectionCode})`)
      })

      // Show blooming status distribution
      const bloomingCount = newTrees.filter(t => t.bloomingStatus === 'blooming').length
      const buddingCount = newTrees.filter(t => t.bloomingStatus === 'budding').length
      const notBloomingCount = newTrees.filter(t => t.bloomingStatus === 'not_blooming').length
      
      console.log('\\n🌸 Blooming Status Distribution:')
      console.log(`   Blooming: ${bloomingCount} trees 🌸`)
      console.log(`   Budding: ${buddingCount} trees 🌿`)
      console.log(`   Not Blooming: ${notBloomingCount} trees 🌱`)
    }

    // Check old trees (should be empty after migration)
    const oldTrees = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count 
      FROM trees 
      WHERE section_id IS NULL
    `

    const oldTreeCount = oldTrees[0]?.count || 0
    console.log(`\\n🔄 Trees (old structure): ${oldTreeCount}`)
    
    if (oldTreeCount > 0) {
      console.log('   ⚠️  Old structure trees still exist - migration not complete')
      
      // Show sample old trees
      const sampleOldTrees = await prisma.$queryRaw<{tree_code: string, plot_id: string}[]>`
        SELECT tree_code, plot_id FROM trees WHERE section_id IS NULL LIMIT 5
      `
      
      console.log('\\n🔤 Sample old tree codes:')
      sampleOldTrees.forEach(tree => {
        console.log(`   ${tree.tree_code} (plot: ${tree.plot_id})`)
      })
    } else {
      console.log('   ✅ No old structure trees found')
    }

    // Check for orphaned data
    const orphanedTrees = await prisma.tree.findMany({
      where: {
        AND: [
          { sectionId: null },
        ]
      }
    })

    if (orphanedTrees.length > 0) {
      console.log(`\\n⚠️  Found ${orphanedTrees.length} orphaned trees (no section reference)`)
    }

    // Migration status assessment
    console.log('\\n🎯 Migration Status:')
    if (sections.length > 0 && newTrees.length > 0 && oldTreeCount === 0) {
      console.log('   ✅ COMPLETED - Hierarchical structure is active')
      console.log('   📝 Structure: Plot → Section → Tree')
      console.log(`   📊 ${plots.length} plots, ${sections.length} sections, ${newTrees.length} trees`)
    } else if (sections.length === 0 && newTrees.length === 0 && oldTreeCount > 0) {
      console.log('   📋 NOT STARTED - Still using flat structure')
      console.log('   📝 Structure: Plot → Tree')
      console.log(`   📊 ${plots.length} plots, ${oldTreeCount} trees`)
    } else {
      console.log('   🔄 IN PROGRESS - Migration partially complete')
      console.log(`   📊 Sections: ${sections.length}, New trees: ${newTrees.length}, Old trees: ${oldTreeCount}`)
    }

  } catch (error) {
    console.error('❌ Status check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run status check
if (require.main === module) {
  checkHierarchicalStatus()
    .then(() => {
      console.log('\\n✅ Status check completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Status check failed:', error)
      process.exit(1)
    })
}

export { checkHierarchicalStatus }