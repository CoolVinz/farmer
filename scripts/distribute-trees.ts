import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function distributeTrees() {
  console.log('🌱 Redistributing trees across plots...')

  try {
    // Get all plots
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' }
    })

    if (plots.length !== 3) {
      throw new Error('Expected 3 plots (A, B, C)')
    }

    // Get all trees currently in plot A
    const allTrees = await prisma.tree.findMany({
      where: { 
        plot: { code: 'A' }
      },
      orderBy: { treeNumber: 'asc' }
    })

    console.log(`📊 Found ${allTrees.length} trees in Plot A`)

    // Distribute trees across plots
    // Plot A: 25 trees (A1-A25)
    // Plot B: 20 trees (B1-B20)  
    // Plot C: 16 trees (C1-C16)

    const plotBTrees = allTrees.slice(25, 45) // 20 trees for plot B
    const plotCTrees = allTrees.slice(45, 61) // 16 trees for plot C

    console.log(`📍 Moving ${plotBTrees.length} trees to Plot B`)
    console.log(`📍 Moving ${plotCTrees.length} trees to Plot C`)

    // Move trees to Plot B
    for (let i = 0; i < plotBTrees.length; i++) {
      const tree = plotBTrees[i]
      const newTreeNumber = i + 1
      const newTreeCode = `B${newTreeNumber}`

      await prisma.tree.update({
        where: { id: tree.id },
        data: {
          plotId: plots.find(p => p.code === 'B')!.id,
          treeNumber: newTreeNumber,
          treeCode: newTreeCode
        }
      })

      console.log(`✓ ${tree.treeCode} → ${newTreeCode}`)
    }

    // Move trees to Plot C
    for (let i = 0; i < plotCTrees.length; i++) {
      const tree = plotCTrees[i]
      const newTreeNumber = i + 1
      const newTreeCode = `C${newTreeNumber}`

      await prisma.tree.update({
        where: { id: tree.id },
        data: {
          plotId: plots.find(p => p.code === 'C')!.id,
          treeNumber: newTreeNumber,
          treeCode: newTreeCode
        }
      })

      console.log(`✓ ${tree.treeCode} → ${newTreeCode}`)
    }

    // Renumber remaining trees in Plot A
    const remainingATrees = allTrees.slice(0, 25)
    for (let i = 0; i < remainingATrees.length; i++) {
      const tree = remainingATrees[i]
      const newTreeNumber = i + 1
      const newTreeCode = `A${newTreeNumber}`

      if (tree.treeCode !== newTreeCode) {
        await prisma.tree.update({
          where: { id: tree.id },
          data: {
            treeNumber: newTreeNumber,
            treeCode: newTreeCode
          }
        })

        console.log(`✓ ${tree.treeCode} → ${newTreeCode}`)
      }
    }

    console.log('\n✅ Tree distribution completed!')

    // Show final summary
    const finalSummary = await Promise.all([
      prisma.tree.count({ where: { plot: { code: 'A' } } }),
      prisma.tree.count({ where: { plot: { code: 'B' } } }),
      prisma.tree.count({ where: { plot: { code: 'C' } } })
    ])

    console.log('\n📊 Final Distribution:')
    console.log(`   Plot A: ${finalSummary[0]} trees (A1-A${finalSummary[0]})`)
    console.log(`   Plot B: ${finalSummary[1]} trees (B1-B${finalSummary[1]})`)
    console.log(`   Plot C: ${finalSummary[2]} trees (C1-C${finalSummary[2]})`)

    // Show sample tree codes from each plot
    const sampleA = await prisma.tree.findMany({
      where: { plot: { code: 'A' } },
      take: 5,
      orderBy: { treeNumber: 'asc' },
      select: { treeCode: true }
    })

    const sampleB = await prisma.tree.findMany({
      where: { plot: { code: 'B' } },
      take: 5,
      orderBy: { treeNumber: 'asc' },
      select: { treeCode: true }
    })

    const sampleC = await prisma.tree.findMany({
      where: { plot: { code: 'C' } },
      take: 5,
      orderBy: { treeNumber: 'asc' },
      select: { treeCode: true }
    })

    console.log('\n🔤 Sample Tree Codes:')
    console.log(`   Plot A: ${sampleA.map(t => t.treeCode).join(', ')}...`)
    console.log(`   Plot B: ${sampleB.map(t => t.treeCode).join(', ')}...`)
    console.log(`   Plot C: ${sampleC.map(t => t.treeCode).join(', ')}...`)

  } catch (error) {
    console.error('❌ Tree distribution failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run distribution
if (require.main === module) {
  distributeTrees()
    .then(() => {
      console.log('\n🎉 Tree distribution successful!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Tree distribution failed:', error)
      process.exit(1)
    })
}

export { distributeTrees }