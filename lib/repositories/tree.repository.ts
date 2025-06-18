import { prisma } from '../prisma'
import { CreateTreeInput, UpdateTreeInput } from '../validations'

export class TreeRepository {
  // Get all trees with relations
  async findMany(options?: {
    skip?: number
    take?: number
    include?: {
      logs?: boolean
    }
  }) {
    return prisma.tree.findMany({
      skip: options?.skip,
      take: options?.take,
      include: {
        logs: options?.include?.logs || false,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get tree by ID
  async findById(id: string, includeLogs = false) {
    return prisma.tree.findUnique({
      where: { id },
      include: {
        logs: includeLogs,
      },
    })
  }

  // Get trees by location
  async findByLocation(locationId: string) {
    return prisma.tree.findMany({
      where: { locationId },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Create new tree
  async create(data: CreateTreeInput) {
    const treeData = {
      locationId: data.locationId,
      variety: data.variety,
      status: data.status,
      treeNumber: parseInt(data.treeNumber, 10),
      plantedDate: data.datePlanted ? new Date(data.datePlanted) : undefined,
    }
    
    return prisma.tree.create({
      data: treeData,
    })
  }

  // Update tree
  async update(id: string, data: UpdateTreeInput) {
    const updateData: any = {}
    
    if (data.locationId) updateData.locationId = data.locationId
    if (data.variety) updateData.variety = data.variety
    if (data.status) updateData.status = data.status
    if (data.treeNumber) updateData.treeNumber = parseInt(data.treeNumber, 10)
    if (data.datePlanted) updateData.plantedDate = new Date(data.datePlanted)

    return prisma.tree.update({
      where: { id },
      data: updateData,
    })
  }

  // Delete tree
  async delete(id: string) {
    return prisma.tree.delete({
      where: { id },
    })
  }

  // Get tree count
  async count() {
    return prisma.tree.count()
  }

  // Get unique locations
  async getUniqueLocations() {
    const result = await prisma.tree.groupBy({
      by: ['locationId'],
      _count: { id: true },
    })
    
    return result.map(item => ({
      locationId: item.locationId,
      treeCount: item._count.id,
    }))
  }

  // Search trees
  async search(query: string) {
    const numericQuery = parseInt(query, 10)
    const searchConditions: any[] = [
      { locationId: { contains: query, mode: 'insensitive' } },
      { variety: { contains: query, mode: 'insensitive' } },
    ]
    
    // Add numeric search for tree number if query is a valid number
    if (!isNaN(numericQuery)) {
      searchConditions.push({ treeNumber: { equals: numericQuery } })
    }
    
    return prisma.tree.findMany({
      where: {
        OR: searchConditions,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get healthy trees count (trees with recent healthy logs or no logs but alive status)
  async getHealthyTreesCount() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Count trees that are either:
    // 1. Have recent healthy logs, or
    // 2. Are alive but have no logs (assume healthy)
    const [treesWithHealthyLogs, treesWithoutLogs] = await Promise.all([
      prisma.tree.count({
        where: {
          status: 'alive',
          logs: {
            some: {
              logDate: { gte: thirtyDaysAgo },
              healthStatus: 'healthy'
            }
          }
        }
      }),
      prisma.tree.count({
        where: {
          status: 'alive',
          logs: { none: {} }
        }
      })
    ])

    return treesWithHealthyLogs + treesWithoutLogs
  }

  // Get tree variety distribution
  async getVarietyDistribution() {
    const result = await prisma.tree.groupBy({
      by: ['variety'],
      _count: { id: true },
      where: { 
        variety: { not: null },
        status: 'alive'
      },
      orderBy: { _count: { id: 'desc' } }
    })
    
    return result.map(item => ({
      variety: item.variety || 'ไม่ระบุ',
      count: item._count.id,
    }))
  }

  // Get trees with recent fruit data for yield calculation
  async getMonthlyYieldData() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    return prisma.tree.findMany({
      where: {
        status: 'alive',
        fruitCount: { gt: 0 }
      },
      select: {
        fruitCount: true,
        variety: true
      }
    })
  }
}