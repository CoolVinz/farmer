import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function seedOriginalFarm() {
  console.log('🌱 Restoring original farm data structure...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.treeLog.deleteMany()
    await prisma.batchLog.deleteMany() 
    await prisma.treeCost.deleteMany()
    await prisma.tree.deleteMany()
    await prisma.section.deleteMany()
    await prisma.plot.deleteMany()
    await prisma.variety.deleteMany()
    await prisma.fertilizer.deleteMany()
    await prisma.pesticide.deleteMany()
    await prisma.plantDisease.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.activityCost.deleteMany()
    await prisma.users.deleteMany()

    // 1. Create Reference Data
    console.log('📋 Creating reference data...')
    
    // Durian varieties
    await prisma.variety.createMany({
      data: [
        { name: 'หมอนทอง' },
        { name: 'ชะนี' },
        { name: 'กันยาว' },
        { name: 'กระดุม' },
        { name: 'ไผ่ทอง' },
        { name: 'หลงลับแล' },
        { name: 'พุทซา' },
        { name: 'ก้อนใหญ่' },
      ],
    })

    // Fertilizers
    await prisma.fertilizer.createMany({
      data: [
        { name: 'ปุ่ยคอก' },
        { name: 'ปุ่ยเคมี 15-15-15' },
        { name: 'ปุ่ยไนโตรเจน' },
        { name: 'ปุ่ยฟอสฟอรัส' },
        { name: 'ปุ่ยโปแตสเซียม' },
        { name: 'ปุ่ยหมัก' },
        { name: 'ปุ่ยน้ำ' },
        { name: 'ปุ่ยใบ' },
      ],
    })

    // Pesticides
    await prisma.pesticide.createMany({
      data: [
        { name: 'ยาฆ่าแมลง' },
        { name: 'ยาฆ่าเชื้อรา' },
        { name: 'สารกำจัดวัชพืช' },
        { name: 'น้ำมันพืช' },
        { name: 'สบู่เหลว' },
        { name: 'ยาฆ่าเชื้อแบคทีเรีย' },
        { name: 'สารป้องกันแมลง' },
      ],
    })

    // Plant diseases
    await prisma.plantDisease.createMany({
      data: [
        { name: 'โรคใบจุด' },
        { name: 'โรคราน้ำค้าง' },
        { name: 'โรคเหม็นเน่า' },
        { name: 'โรคใบไหม้' },
        { name: 'แมลงศัตรูพืช' },
        { name: 'โรคราแป้ง' },
        { name: 'โรคใบแห้ง' },
        { name: 'แมลงกัดกิน' },
      ],
    })

    // Activities
    await prisma.activity.createMany({
      data: [
        { name: 'รดน้ำ' },
        { name: 'ใส่ปุ่ย' },
        { name: 'ฉีดยา' },
        { name: 'ตัดแต่งกิ่ง' },
        { name: 'เก็บเกี่ยว' },
        { name: 'ดูแลทั่วไป' },
        { name: 'กำจัดวัชพืช' },
        { name: 'ป้องกันโรค' },
        { name: 'ตรวจสอบ' },
      ],
    })

    console.log('✅ Reference data created successfully!')

    // 2. Create Plots A, B, C
    console.log('🗺️ Creating farm plots...')
    
    const plots = [
      {
        code: 'A',
        name: 'สวนวิสุทธิ์ศิริ - แปลง A',
        description: 'แปลงหลักปลูกทุเรียน - แปลง A',
        area: 5.0, // 5 ไร่
        soilType: 'ดินเหนียว'
      },
      {
        code: 'B',
        name: 'สวนวิสุทธิ์ศิริ - แปลง B', 
        description: 'แปลงรองปลูกทุเรียน - แปลง B',
        area: 4.5, // 4.5 ไร่
        soilType: 'ดินร่วน'
      },
      {
        code: 'C',
        name: 'สวนวิสุทธิ์ศิริ - แปลง C',
        description: 'แปลงเสริมปลูกทุเรียน - แปลง C', 
        area: 3.5, // 3.5 ไร่
        soilType: 'ดินร่วนปนทราย'
      }
    ]

    const createdPlots = []
    for (const plotData of plots) {
      const plot = await prisma.plot.create({ data: plotData })
      createdPlots.push(plot)
      console.log(`✓ Created plot ${plot.code}: ${plot.name}`)
    }

    // 3. Create Sections
    console.log('📍 Creating sections...')
    
    let totalSections = 0
    
    // Plot A: 60 sections (A1 - A60)
    console.log('  Creating Plot A sections (A1-A60)...')
    for (let i = 1; i <= 60; i++) {
      await prisma.section.create({
        data: {
          plotId: createdPlots[0].id, // Plot A
          sectionNumber: i,
          sectionCode: `A${i}`,
          name: `โซน A${i}`,
          area: 0.08, // ~80 ตรม. per section
          soilType: 'ดินเหนียว',
          description: `โซนที่ ${i} ในแปลง A`
        }
      })
      totalSections++
    }

    // Plot B: 30 sections (B1 - B30)
    console.log('  Creating Plot B sections (B1-B30)...')
    for (let i = 1; i <= 30; i++) {
      await prisma.section.create({
        data: {
          plotId: createdPlots[1].id, // Plot B
          sectionNumber: i,
          sectionCode: `B${i}`,
          name: `โซน B${i}`,
          area: 0.15, // ~150 ตรม. per section
          soilType: 'ดินร่วน',
          description: `โซนที่ ${i} ในแปลง B`
        }
      })
      totalSections++
    }

    // Plot C: 20 sections (C1 - C20)
    console.log('  Creating Plot C sections (C1-C20)...')
    for (let i = 1; i <= 20; i++) {
      await prisma.section.create({
        data: {
          plotId: createdPlots[2].id, // Plot C
          sectionNumber: i,
          sectionCode: `C${i}`,
          name: `โซน C${i}`,
          area: 0.175, // ~175 ตรม. per section
          soilType: 'ดินร่วนปนทราย',
          description: `โซนที่ ${i} ในแปลง C`
        }
      })
      totalSections++
    }

    console.log(`✅ Created ${totalSections} sections total (A: 60, B: 30, C: 20)`)

    // 4. Optional: Create sample trees for demonstration
    console.log('🌳 Creating sample trees...')
    
    // Get all sections for tree creation
    const allSections = await prisma.section.findMany({
      include: { plot: true },
      orderBy: [{ plotId: 'asc' }, { sectionNumber: 'asc' }]
    })

    const varieties = ['หมอนทอง', 'ชะนี', 'กันยาว', 'กระดุม', 'ไผ่ทอง']
    let treeCount = 0

    // Create 1-3 trees per section (for demonstration)
    for (const section of allSections.slice(0, 20)) { // Only first 20 sections for demo
      const treesInSection = Math.floor(Math.random() * 3) + 1 // 1-3 trees

      for (let t = 1; t <= treesInSection; t++) {
        const treeCode = `${section.sectionCode}-${t.toString().padStart(2, '0')}`
        
        await prisma.tree.create({
          data: {
            location_id: treeCode,
            treeCode: treeCode,
            variety: varieties[Math.floor(Math.random() * varieties.length)],
            plantedDate: new Date(2020 + Math.floor(Math.random() * 4), 
                                Math.floor(Math.random() * 12), 
                                Math.floor(Math.random() * 28) + 1),
            status: Math.random() > 0.95 ? 'sick' : 'alive',
            treeNumber: t,
            sectionId: section.id,
            fruitCount: Math.floor(Math.random() * 80) + 20,
            bloomingStatus: ['blooming', 'budding', 'not_blooming'][Math.floor(Math.random() * 3)],
            treeHeight: 3.0 + Math.random() * 2.0, // 3-5 meters
            trunkDiameter: 0.3 + Math.random() * 0.4, // 30-70 cm
          }
        })
        treeCount++
      }
    }

    console.log(`✅ Created ${treeCount} sample trees`)

    // 5. Final Summary
    console.log('\n🎉 Original farm data restoration completed!')
    
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

    const totalTreesCount = await prisma.tree.count()
    const varietiesCount = await prisma.variety.count()
    const fertilizersCount = await prisma.fertilizer.count()
    const pesticidesCount = await prisma.pesticide.count()
    const diseasesCount = await prisma.plantDisease.count()
    const activitiesCount = await prisma.activity.count()

    console.log('\n📊 Farm Structure Summary:')
    plotSummary.forEach(plot => {
      console.log(`   ${plot.code}: ${plot.name} (${plot._count.sections} sections, ${plot.area} ไร่)`)
    })

    console.log('\n📋 Reference Data Summary:')
    console.log(`   - ${varietiesCount} durian varieties`)
    console.log(`   - ${fertilizersCount} fertilizer types`)
    console.log(`   - ${pesticidesCount} pesticide types`)
    console.log(`   - ${diseasesCount} plant diseases`)
    console.log(`   - ${activitiesCount} farm activities`)
    console.log(`   - ${totalTreesCount} sample trees`)

    console.log('\n✅ Your original farm structure has been restored!')
    console.log('🌱 Ready for logging activities and tree management!')

  } catch (error) {
    console.error('❌ Farm restoration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding
if (require.main === module) {
  seedOriginalFarm()
    .then(() => {
      console.log('✅ Farm restoration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Farm restoration failed:', error)
      process.exit(1)
    })
}

export { seedOriginalFarm }