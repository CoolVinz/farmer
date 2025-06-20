import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development database...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.treeLog.deleteMany();
  await prisma.batchLog.deleteMany(); 
  await prisma.treeCost.deleteMany();
  await prisma.tree.deleteMany();
  await prisma.section.deleteMany();
  await prisma.plot.deleteMany();
  await prisma.variety.deleteMany();
  await prisma.fertilizer.deleteMany();
  await prisma.pesticide.deleteMany();
  await prisma.plantDisease.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.activityCost.deleteMany();
  await prisma.users.deleteMany();

  // Seed reference data
  console.log('📋 Creating reference data...');
  
  const varieties = await prisma.variety.createMany({
    data: [
      { name: 'มะม่วงน้ำดอกไม้' },
      { name: 'มะม่วงเขียวเสวย' },
      { name: 'มะม่วงแก้วตายตัว' },
      { name: 'มะม่วงพิมเสน' },
      { name: 'มะม่วงโชคอนันต์' },
    ],
  });

  const fertilizers = await prisma.fertilizer.createMany({
    data: [
      { name: 'ปุ่ยคอก' },
      { name: 'ปุ่ยเคมี 15-15-15' },
      { name: 'ปุ่ยไนโตรเจน' },
      { name: 'ปุ่ยฟอสฟอรัส' },
      { name: 'ปุ่ยโปแตสเซียม' },
    ],
  });

  const pesticides = await prisma.pesticide.createMany({
    data: [
      { name: 'ยาฆ่าแมลง' },
      { name: 'ยาฆ่าเชื้อรา' },
      { name: 'สารกำจัดวัชพืช' },
      { name: 'น้ำมันพืช' },
      { name: 'สบู่เหลว' },
    ],
  });

  const activities = await prisma.activity.createMany({
    data: [
      { name: 'รดน้ำ' },
      { name: 'ใส่ปุ่ย' },
      { name: 'ฉีดยา' },
      { name: 'ตัดแต่งกิ่ง' },
      { name: 'เก็บเกี่ยว' },
      { name: 'ดูแลทั่วไป' },
    ],
  });

  // Create test plots
  console.log('🗺️ Creating plots and sections...');
  
  const plot1 = await prisma.plot.create({
    data: {
      code: 'DEV-01',
      name: 'แปลงทดสอบ 1',
      area: 500,
      soilType: 'ดินเหนียว',
      description: 'แปลงสำหรับทดสอบระบบ',
    },
  });

  const plot2 = await prisma.plot.create({
    data: {
      code: 'DEV-02', 
      name: 'แปลงทดสอบ 2',
      area: 300,
      soilType: 'ดินร่วน',
      description: 'แปลงทดสอบเพิ่มเติม',
    },
  });

  // Create sections
  const section1 = await prisma.section.create({
    data: {
      plotId: plot1.id,
      sectionNumber: 1,
      sectionCode: 'DEV-01-A',
      name: 'โคก A',
      area: 250,
      soilType: 'ดินเหนียว',
    },
  });

  const section2 = await prisma.section.create({
    data: {
      plotId: plot1.id,
      sectionNumber: 2,
      sectionCode: 'DEV-01-B',
      name: 'โคก B',
      area: 250,
      soilType: 'ดินเหนียว',
    },
  });

  const section3 = await prisma.section.create({
    data: {
      plotId: plot2.id,
      sectionNumber: 1,
      sectionCode: 'DEV-02-A',
      name: 'โคก A',
      area: 300,
      soilType: 'ดินร่วน',
    },
  });

  // Create test trees
  console.log('🌳 Creating test trees...');
  
  const trees = [];
  
  // Section 1 trees
  for (let i = 1; i <= 10; i++) {
    const tree = await prisma.tree.create({
      data: {
        location_id: `A${i.toString().padStart(2, '0')}`,
        treeCode: `A${i.toString().padStart(2, '0')}`,
        variety: i % 2 === 0 ? 'มะม่วงน้ำดอกไม้' : 'มะม่วงเขียวเสวย',
        plantedDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: 'alive',
        treeNumber: i,
        sectionId: section1.id,
        fruitCount: Math.floor(Math.random() * 50) + 10,
        bloomingStatus: ['blooming', 'budding', 'not_blooming'][Math.floor(Math.random() * 3)],
      },
    });
    trees.push(tree);
  }

  // Section 2 trees
  for (let i = 1; i <= 8; i++) {
    const tree = await prisma.tree.create({
      data: {
        location_id: `B${i.toString().padStart(2, '0')}`,
        treeCode: `B${i.toString().padStart(2, '0')}`,
        variety: i % 3 === 0 ? 'มะม่วงแก้วตายตัว' : 'มะม่วงพิมเสน',
        plantedDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: 'alive',
        treeNumber: i,
        sectionId: section2.id,
        fruitCount: Math.floor(Math.random() * 40) + 5,
        bloomingStatus: ['blooming', 'budding', 'not_blooming'][Math.floor(Math.random() * 3)],
      },
    });
    trees.push(tree);
  }

  // Section 3 trees
  for (let i = 1; i <= 12; i++) {
    const tree = await prisma.tree.create({
      data: {
        location_id: `C${i.toString().padStart(2, '0')}`,
        treeCode: `C${i.toString().padStart(2, '0')}`,
        variety: 'มะม่วงโชคอนันต์',
        plantedDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        status: Math.random() > 0.9 ? 'sick' : 'alive',
        treeNumber: i,
        sectionId: section3.id,
        fruitCount: Math.floor(Math.random() * 60) + 15,
        bloomingStatus: ['blooming', 'budding', 'not_blooming'][Math.floor(Math.random() * 3)],
      },
    });
    trees.push(tree);
  }

  // Create sample tree logs with yield changes
  console.log('📝 Creating sample logs...');
  
  const sampleLogs = [
    { notes: 'จำนวนผลไม้เพิ่มขึ้นจาก 20 ลูก เป็น 35 ลูก (+15)', activityType: 'ดูแลทั่วไป' },
    { notes: 'ตรวจนับผลไม้ จาก 45 ลูก เป็น 42 ลูก (-3)', activityType: 'ตรวจสอบ' },
    { notes: 'ผลไม้เพิ่มขึ้นดี จาก 30 ลูก เป็น 48 ลูก (+18)', activityType: 'ใส่ปุ่ย' },
    { notes: 'เก็บเกี่ยวบางส่วน จาก 50 ลูก เป็น 35 ลูก (-15)', activityType: 'เก็บเกี่ยว' },
    { notes: 'ดอกบาน คาดว่าจะได้ผลไม้เพิ่ม จาก 25 ลูก เป็น 40 ลูก (+15)', activityType: 'ดูแลทั่วไป' },
  ];

  for (let i = 0; i < Math.min(trees.length, 15); i++) {
    const tree = trees[i];
    const logData = sampleLogs[i % sampleLogs.length];
    
    await prisma.treeLog.create({
      data: {
        treeId: tree.id,
        logDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        notes: logData.notes,
        activityType: logData.activityType,
        healthStatus: ['healthy', 'sick', 'pest'][Math.floor(Math.random() * 3)],
        fertilizerType: Math.random() > 0.5 ? 'ปุ่ยคอก' : 'ปุ่ยเคมี 15-15-15',
        createdBy: 'dev-seed',
      },
    });
  }

  // Create some cost records
  console.log('💰 Creating cost records...');
  
  await prisma.treeCost.createMany({
    data: [
      {
        costDate: new Date(),
        activityType: 'ใส่ปุ่ย',
        target: 'ทั้งสวน',
        amount: 5000,
        notes: 'ซื้อปุ่ยคอกสำหรับเดือนนี้',
      },
      {
        costDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        activityType: 'ฉีดยา',
        target: 'แปลง DEV-01',
        amount: 2500,
        notes: 'ยาฆ่าแมลงและเชื้อรา',
      },
      {
        costDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        activityType: 'ดูแลทั่วไป',
        target: 'ทั้งสวน',
        amount: 1500,
        notes: 'ค่าแรงงานตัดแต่งกิ่ง',
      },
    ],
  });

  console.log('✅ Development database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`  - ${trees.length} trees across 3 sections`);
  console.log(`  - Sample logs with yield tracking data`);  
  console.log(`  - Reference data (varieties, fertilizers, etc.)`);
  console.log(`  - Cost tracking examples`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });