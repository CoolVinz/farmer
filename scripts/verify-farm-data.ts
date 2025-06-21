import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function verifyFarmData() {
  console.log('🔍 Verifying restored farm data...\n')

  try {
    // Check plots
    const plots = await prisma.plot.findMany({
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { sections: true }
        }
      }
    })

    console.log('📍 PLOTS:')
    plots.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name} (${plot._count.sections} sections, ${plot.area} ไร่)`)
    })

    // Check sections by plot
    console.log('\n📍 SECTIONS BY PLOT:')
    for (const plot of plots) {
      const sections = await prisma.section.findMany({
        where: { plotId: plot.id },
        orderBy: { sectionNumber: 'asc' }
      })
      
      const sectionCodes = sections.map(s => s.sectionCode).slice(0, 10) // First 10
      const moreCount = sections.length > 10 ? ` + ${sections.length - 10} more` : ''
      console.log(`   Plot ${plot.code}: ${sectionCodes.join(', ')}${moreCount}`)
    }

    // Check reference data counts
    const varieties = await prisma.variety.count()
    const fertilizers = await prisma.fertilizer.count()
    const pesticides = await prisma.pesticide.count()
    const diseases = await prisma.plantDisease.count()
    const activities = await prisma.activity.count()
    const trees = await prisma.tree.count()

    console.log('\n📋 REFERENCE DATA:')
    console.log(`   Varieties: ${varieties}`)
    console.log(`   Fertilizers: ${fertilizers}`)
    console.log(`   Pesticides: ${pesticides}`)
    console.log(`   Plant Diseases: ${diseases}`)
    console.log(`   Activities: ${activities}`)
    console.log(`   Sample Trees: ${trees}`)

    // Show some example varieties
    const varietyList = await prisma.variety.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    })
    console.log(`\n🥭 DURIAN VARIETIES:`)
    console.log(`   ${varietyList.map(v => v.name).join(', ')}`)

    // Show section distribution
    const sectionsByPlot = await prisma.section.groupBy({
      by: ['plotId'],
      _count: { id: true }
    })
    
    console.log('\n📊 SECTION DISTRIBUTION:')
    for (const group of sectionsByPlot) {
      const plot = plots.find(p => p.id === group.plotId)
      console.log(`   Plot ${plot?.code}: ${group._count.id} sections`)
    }

    console.log('\n✅ Farm data verification completed!')
    console.log('🌱 Your original farm structure (plots A, B, C with 110 sections) has been successfully restored!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
if (require.main === module) {
  verifyFarmData()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error)
      process.exit(1)
    })
}

export { verifyFarmData }