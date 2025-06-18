import { prisma } from '../prisma'
import { CreateTreeInput, UpdateTreeInput } from '../validations'

export class TreeRepository {
  // Get all trees with relations
  async findMany(options?: {
    skip?: number
    take?: number
    plotId?: string
    include?: {
      logs?: boolean
      plot?: boolean
    }
  }) {
    return prisma.tree.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.plotId ? { plotId: options.plotId } : undefined,
      include: {
        logs: options?.include?.logs || false,
        plot: options?.include?.plot || false,
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Get tree by ID
  async findById(id: string, options?: {
    includeLogs?: boolean
    includePlot?: boolean
  }) {
    return prisma.tree.findUnique({
      where: { id },
      include: {
        logs: options?.includeLogs || false,
        plot: options?.includePlot || false,
      },
    })
  }

  // Get tree by tree code (A1, B3, etc.)
  async findByTreeCode(treeCode: string) {
    return prisma.tree.findUnique({
      where: { treeCode: treeCode.toUpperCase() },
      include: {
        plot: true,
        logs: {
          orderBy: { logDate: 'desc' },
          take: 5 // Get recent logs
        }
      },
    })
  }

  // Get trees by plot
  async findByPlot(plotId: string) {
    return prisma.tree.findMany({
      where: { plotId },
      include: {
        plot: true,
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Get trees by plot code (A, B, C)
  async findByPlotCode(plotCode: string) {
    return prisma.tree.findMany({
      where: { 
        plot: { 
          code: plotCode.toUpperCase() 
        } 
      },
      include: {
        plot: true,
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Create new tree
  async create(data: CreateTreeInput & { plotId: string }) {
    // Get the plot to generate tree code
    const plot = await prisma.plot.findUnique({
      where: { id: data.plotId },
      select: { code: true }
    })

    if (!plot) {
      throw new Error('Plot not found')
    }

    // Get next tree number for this plot
    const lastTree = await prisma.tree.findFirst({
      where: { plotId: data.plotId },
      orderBy: { treeNumber: 'desc' },
      select: { treeNumber: true }
    })

    const treeNumber = (lastTree?.treeNumber || 0) + 1
    const treeCode = `${plot.code}${treeNumber}`

    const treeData = {
      plotId: data.plotId,
      treeNumber,
      treeCode,
      variety: data.variety,
      status: data.status || 'alive',
      plantedDate: data.datePlanted ? new Date(data.datePlanted) : undefined,
    }
    
    return prisma.tree.create({
      data: treeData,
      include: {
        plot: true
      }
    })
  }

  // Update tree
  async update(id: string, data: UpdateTreeInput) {
    const updateData: any = {}
    
    if (data.variety) updateData.variety = data.variety
    if (data.status) updateData.status = data.status
    if (data.datePlanted) updateData.plantedDate = new Date(data.datePlanted)

    return prisma.tree.update({
      where: { id },
      data: updateData,
      include: {
        plot: true
      }
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

  // Get plot summaries
  async getPlotSummaries() {
    const result = await prisma.tree.groupBy({
      by: ['plotId'],
      _count: { id: true },
    })
    
    // Get plot details
    const plotSummaries = await Promise.all(
      result.map(async (item) => {
        const plot = await prisma.plot.findUnique({
          where: { id: item.plotId },
          select: { code: true, name: true }
        })
        
        return {
          plotId: item.plotId,
          plotCode: plot?.code || 'Unknown',
          plotName: plot?.name || 'Unknown Plot',
          treeCount: item._count.id,
        }
      })
    )
    
    return plotSummaries.sort((a, b) => a.plotCode.localeCompare(b.plotCode))
  }

  // Search trees
  async search(query: string) {
    const numericQuery = parseInt(query, 10)
    const searchConditions: any[] = [
      { treeCode: { contains: query, mode: 'insensitive' } },
      { variety: { contains: query, mode: 'insensitive' } },
      { plot: { code: { contains: query, mode: 'insensitive' } } },
      { plot: { name: { contains: query, mode: 'insensitive' } } },
    ]
    
    // Add numeric search for tree number if query is a valid number
    if (!isNaN(numericQuery)) {
      searchConditions.push({ treeNumber: { equals: numericQuery } })
    }
    
    return prisma.tree.findMany({
      where: {
        OR: searchConditions,
      },
      include: {
        plot: true,
      },
      orderBy: { treeCode: 'asc' },
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