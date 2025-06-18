import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function cleanupPartialMigration() {
  console.log('🧹 Cleaning up partial migration...')

  try {
    // Check existing sections
    const existingSections = await prisma.section.findMany({
      include: {
        _count: {
          select: {
            trees: true
          }
        }
      }
    })

    console.log(`\\n📂 Found ${existingSections.length} existing sections:`)
    existingSections.forEach(section => {
      console.log(`   ${section.sectionCode}: ${section._count.trees} trees`)
    })

    // Delete all existing sections (this will cascade delete associated trees)
    if (existingSections.length > 0) {
      console.log('\\n🗑️  Removing existing sections...')
      
      for (const section of existingSections) {
        await prisma.section.delete({
          where: { id: section.id }
        })
        console.log(`   ✓ Removed section ${section.sectionCode}`)
      }
    }

    // Check trees with section references
    const treesWithSections = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE section_id IS NOT NULL
    `

    const treesWithSectionCount = treesWithSections[0]?.count || 0
    console.log(`\\n🌳 Trees with section references: ${treesWithSectionCount}`)

    if (treesWithSectionCount > 0) {
      // Remove section references from trees
      console.log('\\n🔄 Removing section references from trees...')
      await prisma.$executeRaw`
        UPDATE trees SET section_id = NULL WHERE section_id IS NOT NULL
      `
      console.log(`   ✓ Cleared section references from ${treesWithSectionCount} trees`)
    }

    // Check final state
    const finalOldTrees = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE plot_id IS NOT NULL
    `

    const finalSections = await prisma.section.count()
    
    console.log('\\n✅ Cleanup completed!')
    console.log(`   📂 Sections remaining: ${finalSections}`)
    console.log(`   🌳 Old trees ready for migration: ${finalOldTrees[0]?.count || 0}`)

    if (finalSections === 0 && (finalOldTrees[0]?.count || 0) > 0) {
      console.log('\\n🎯 Database is clean and ready for fresh migration')
    } else {
      console.log('\\n⚠️  Manual cleanup may be needed')
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup
if (require.main === module) {
  cleanupPartialMigration()
    .then(() => {
      console.log('\\n🎉 Cleanup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error)
      process.exit(1)
    })
}

export { cleanupPartialMigration }