import { prisma } from '../prisma'
import { CreateTreeInput, UpdateTreeInput } from '../validations'

export class TreeRepository {
  // Get all trees with relations
  async findMany(options?: {
    skip?: number
    take?: number
    sectionId?: string
    plotId?: string
    include?: {
      logs?: boolean
      section?: boolean
      plot?: boolean
    }
  }) {
    let whereClause: any = undefined
    
    if (options?.sectionId) {
      whereClause = { sectionId: options.sectionId }
    } else if (options?.plotId) {
      whereClause = { section: { plotId: options.plotId } }
    }

    return prisma.tree.findMany({
      skip: options?.skip,
      take: options?.take,
      where: whereClause,
      include: {
        logs: options?.include?.logs || false,
        section: options?.include?.section || false,
        ...(options?.include?.plot && {
          section: {
            include: {
              plot: true
            }
          }
        })
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Get tree by ID
  async findById(id: string, options?: {
    includeLogs?: boolean
    includeSection?: boolean
    includePlot?: boolean
  }) {
    return prisma.tree.findUnique({
      where: { id },
      include: {
        logs: options?.includeLogs || false,
        section: options?.includeSection || options?.includePlot ? {
          include: {
            plot: options?.includePlot || false
          }
        } : false,
      },
    })
  }

  // Get tree by tree code (A3-T1, A3-T2, etc.)
  async findByTreeCode(treeCode: string) {
    return prisma.tree.findUnique({
      where: { treeCode: treeCode.toUpperCase() },
      include: {
        section: {
          include: {
            plot: true
          }
        },
        logs: {
          orderBy: { logDate: 'desc' },
          take: 5 // Get recent logs
        }
      },
    })
  }

  // Get trees by section
  async findBySection(sectionId: string) {
    return prisma.tree.findMany({
      where: { sectionId },
      include: {
        section: {
          include: {
            plot: true
          }
        },
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Get trees by plot (through sections)
  async findByPlot(plotId: string) {
    return prisma.tree.findMany({
      where: { 
        section: { 
          plotId 
        } 
      },
      include: {
        section: {
          include: {
            plot: true
          }
        },
      },
      orderBy: [
        { section: { sectionNumber: 'asc' } },
        { treeNumber: 'asc' }
      ],
    })
  }

  // Get trees by section code (A1, A2, B3, etc.)
  async findBySectionCode(sectionCode: string) {
    return prisma.tree.findMany({
      where: { 
        section: { 
          sectionCode: sectionCode.toUpperCase() 
        } 
      },
      include: {
        section: {
          include: {
            plot: true
          }
        },
      },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Get trees by plot code (A, B, C)
  async findByPlotCode(plotCode: string) {
    return prisma.tree.findMany({
      where: { 
        section: {
          plot: { 
            code: plotCode.toUpperCase() 
          }
        }
      },
      include: {
        section: {
          include: {
            plot: true
          }
        }
      },
      orderBy: [
        { section: { sectionNumber: 'asc' } },
        { treeNumber: 'asc' }
      ],
    })
  }

  // Create new tree
  async create(data: CreateTreeInput & { sectionId: string }) {
    // Get the section to generate tree code
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      select: { sectionCode: true }
    })

    if (!section) {
      throw new Error('Section not found')
    }

    // Get next tree number for this section
    const lastTree = await prisma.tree.findFirst({
      where: { sectionId: data.sectionId },
      orderBy: { treeNumber: 'desc' },
      select: { treeNumber: true }
    })

    const treeNumber = (lastTree?.treeNumber || 0) + 1
    const treeCode = `${section.sectionCode}-T${treeNumber}`

    const treeData = {
      sectionId: data.sectionId,
      location_id: `${treeCode}`, // Use tree code as location ID
      treeNumber,
      treeCode,
      variety: data.variety,
      status: data.status || 'alive',
      bloomingStatus: data.bloomingStatus || 'not_blooming',
      plantedDate: data.datePlanted ? new Date(data.datePlanted) : undefined,
      fruitCount: data.fruitCount || 0,
      imagePath: data.imagePath,
    }
    
    return prisma.tree.create({
      data: treeData,
      include: {
        section: {
          include: {
            plot: true
          }
        }
      }
    })
  }

  // Update tree
  async update(id: string, data: UpdateTreeInput) {
    const updateData: any = {}
    
    if (data.variety) updateData.variety = data.variety
    if (data.status) updateData.status = data.status
    if (data.bloomingStatus) updateData.bloomingStatus = data.bloomingStatus
    if (data.datePlanted) updateData.plantedDate = new Date(data.datePlanted)
    if (data.fruitCount !== undefined) updateData.fruitCount = data.fruitCount
    if (data.imagePath !== undefined) updateData.imagePath = data.imagePath

    return prisma.tree.update({
      where: { id },
      data: updateData,
      include: {
        section: {
          include: {
            plot: true
          }
        }
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

  // Get section summaries
  async getSectionSummaries() {
    const result = await prisma.tree.groupBy({
      by: ['sectionId'],
      _count: { id: true },
    })
    
    // Get section details
    const sectionSummaries = await Promise.all(
      result.map(async (item) => {
        if (!item.sectionId) {
          return { ...item, sectionCode: null, sectionName: null, plotCode: null, plotName: null }
        }
        
        const section = await prisma.section.findUnique({
          where: { id: item.sectionId },
          select: { 
            sectionCode: true, 
            name: true,
            plot: {
              select: {
                code: true,
                name: true
              }
            }
          }
        })
        
        return {
          sectionId: item.sectionId,
          sectionCode: section?.sectionCode || 'Unknown',
          sectionName: section?.name || `Section ${section?.sectionCode}`,
          plotCode: section?.plot?.code || 'Unknown',
          plotName: section?.plot?.name || 'Unknown Plot',
          treeCount: item._count.id,
        }
      })
    )
    
    return sectionSummaries.sort((a, b) => {
      if (!a.sectionCode && !b.sectionCode) return 0
      if (!a.sectionCode) return 1
      if (!b.sectionCode) return -1
      return a.sectionCode.localeCompare(b.sectionCode)
    })
  }

  // Get plot summaries (aggregated from sections)
  async getPlotSummaries() {
    const sections = await prisma.section.findMany({
      include: {
        plot: true,
        _count: {
          select: {
            trees: true
          }
        }
      }
    })
    
    // Group by plot
    const plotMap = new Map()
    
    sections.forEach(section => {
      const plotId = section.plotId
      if (!plotMap.has(plotId)) {
        plotMap.set(plotId, {
          plotId,
          plotCode: section.plot.code,
          plotName: section.plot.name,
          treeCount: 0,
          sectionCount: 0
        })
      }
      
      const plotData = plotMap.get(plotId)
      plotData.treeCount += section._count.trees
      plotData.sectionCount += 1
    })
    
    return Array.from(plotMap.values()).sort((a, b) => a.plotCode.localeCompare(b.plotCode))
  }

  // Search trees
  async search(query: string) {
    const numericQuery = parseInt(query, 10)
    const searchConditions: any[] = [
      { treeCode: { contains: query, mode: 'insensitive' } },
      { variety: { contains: query, mode: 'insensitive' } },
      { bloomingStatus: { contains: query, mode: 'insensitive' } },
      { section: { sectionCode: { contains: query, mode: 'insensitive' } } },
      { section: { name: { contains: query, mode: 'insensitive' } } },
      { section: { plot: { code: { contains: query, mode: 'insensitive' } } } },
      { section: { plot: { name: { contains: query, mode: 'insensitive' } } } },
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
        section: {
          include: {
            plot: true
          }
        }
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

  // Get blooming status distribution
  async getBloomingStatusDistribution() {
    const result = await prisma.tree.groupBy({
      by: ['bloomingStatus'],
      _count: { id: true },
      where: { 
        status: 'alive'
      },
      orderBy: { _count: { id: 'desc' } }
    })
    
    return result.map(item => ({
      status: item.bloomingStatus || 'ไม่ระบุ',
      count: item._count.id,
    }))
  }

  // Get trees by blooming status
  async findByBloomingStatus(bloomingStatus: string) {
    return prisma.tree.findMany({
      where: { 
        bloomingStatus: bloomingStatus,
        status: 'alive'
      },
      include: {
        section: {
          include: {
            plot: true
          }
        }
      },
      orderBy: { treeCode: 'asc' },
    })
  }

  // Update blooming status for multiple trees
  async updateBloomingStatus(treeIds: string[], bloomingStatus: string) {
    return prisma.tree.updateMany({
      where: {
        id: { in: treeIds }
      },
      data: {
        bloomingStatus
      }
    })
  }

  // Get trees that need attention (sick, no recent logs, etc.)
  async getTreesNeedingAttention() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return prisma.tree.findMany({
      where: {
        OR: [
          { status: 'sick' },
          {
            AND: [
              { status: 'alive' },
              {
                logs: {
                  none: {
                    logDate: { gte: thirtyDaysAgo }
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        section: {
          include: {
            plot: true
          }
        },
        logs: {
          orderBy: { logDate: 'desc' },
          take: 1
        }
      },
      orderBy: { treeCode: 'asc' }
    })
  }
}