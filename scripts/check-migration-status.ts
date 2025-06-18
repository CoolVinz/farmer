import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status...')

  try {
    // Check if plots exist
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })
    
    console.log(`\n📊 Plots found: ${plots.length}`)
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name}`)
    })

    // Check trees with plot_id
    const treesWithPlotId = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE plot_id IS NOT NULL
    `
    
    const treesWithoutPlotId = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE plot_id IS NULL
    `

    console.log(`\n🌳 Trees with plot_id: ${treesWithPlotId[0]?.count || 0}`)
    console.log(`🌳 Trees without plot_id: ${treesWithoutPlotId[0]?.count || 0}`)

    // Check tree codes
    const treesWithCodes = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*)::int as count FROM trees WHERE tree_code IS NOT NULL
    `

    console.log(`🔤 Trees with codes: ${treesWithCodes[0]?.count || 0}`)

    // Sample tree codes
    const sampleTrees = await prisma.$queryRaw<{tree_code: string, plot_id: string}[]>`
      SELECT tree_code, plot_id FROM trees WHERE tree_code IS NOT NULL LIMIT 10
    `

    if (sampleTrees.length > 0) {
      console.log('\n🔤 Sample tree codes:')
      sampleTrees.forEach(tree => {
        console.log(`   ${tree.tree_code} (plot: ${tree.plot_id})`)
      })
    }

    // Check if we need to complete migration
    const needsMigration = treesWithoutPlotId[0]?.count > 0
    
    if (needsMigration) {
      console.log('\n⚠️  Migration not complete - some trees still need plot assignment')
    } else {
      console.log('\n✅ Migration appears complete - all trees have plot assignments')
    }

    // Check for constraint violations
    const duplicateCodes = await prisma.$queryRaw<{tree_code: string, count: number}[]>`
      SELECT tree_code, COUNT(*)::int as count 
      FROM trees 
      WHERE tree_code IS NOT NULL 
      GROUP BY tree_code 
      HAVING COUNT(*) > 1
    `

    if (duplicateCodes.length > 0) {
      console.log('\n⚠️  Duplicate tree codes found:')
      duplicateCodes.forEach(dup => {
        console.log(`   ${dup.tree_code}: ${dup.count} trees`)
      })
    }

  } catch (error) {
    console.error('❌ Status check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run status check
if (require.main === module) {
  checkMigrationStatus()
    .then(() => {
      console.log('\n✅ Status check completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Status check failed:', error)
      process.exit(1)
    })
}

export { checkMigrationStatus }