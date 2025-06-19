import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function seedPlots() {
  console.log('🌱 Seeding garden plots...')

  try {
    // Create the three main plots
    const plots = [
      {
        code: 'A',
        name: 'Garden Plot A',
        description: 'Main durian cultivation area - Plot A',
        area: 5.0 // 5 rai
      },
      {
        code: 'B',
        name: 'Garden Plot B', 
        description: 'Secondary durian cultivation area - Plot B',
        area: 4.5 // 4.5 rai
      },
      {
        code: 'C',
        name: 'Garden Plot C',
        description: 'Tertiary durian cultivation area - Plot C', 
        area: 3.5 // 3.5 rai
      }
    ]

    for (const plotData of plots) {
      const plot = await prisma.plot.upsert({
        where: { code: plotData.code },
        update: {},
        create: plotData
      })
      
      console.log(`✓ Created/found plot ${plot.code}: ${plot.name}`)
    }

    console.log('✅ Plot seeding completed successfully!')
    
    // Show summary
    const plotSummary = await prisma.plot.findMany({
      include: {
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    console.log('\n📊 Plot Summary:')
    plotSummary.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name} (${plot._count.sections} sections)`)
    })

  } catch (error) {
    console.error('❌ Plot seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding
if (require.main === module) {
  seedPlots()
    .then(() => {
      console.log('✅ Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export { seedPlots }