import { prisma } from '../prisma'

export interface CreateSectionInput {
  plotId: string
  name?: string
  description?: string
  area?: number
  soilType?: string
}

export interface UpdateSectionInput {
  name?: string
  description?: string
  area?: number
  soilType?: string
}

export class SectionRepository {
  // Get all sections with optional relations
  async findMany(options?: {
    plotId?: string
    includeTrees?: boolean
    includeTreeCount?: boolean
    includePlot?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    if (options?.includePlot) {
      include.plot = true
    }

    const whereClause = options?.plotId ? { plotId: options.plotId } : undefined

    const sections = await prisma.section.findMany({
      where: whereClause,
      include,
      orderBy: [
        { plot: { code: 'asc' } },
        { sectionNumber: 'asc' }
      ],
    })

    if (options?.includeTreeCount) {
      // Add tree counts to each section
      const sectionsWithCounts = await Promise.all(
        sections.map(async (section) => {
          const treeCount = await prisma.tree.count({
            where: { sectionId: section.id }
          })
          return {
            ...section,
            treeCount
          }
        })
      )
      return sectionsWithCounts
    }

    return sections
  }

  // Get section by ID
  async findById(id: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
    includePlot?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    if (options?.includePlot) {
      include.plot = true
    }

    const section = await prisma.section.findUnique({
      where: { id },
      include,
    })

    if (!section) return null

    if (options?.includeTreeCount) {
      const treeCount = await prisma.tree.count({
        where: { sectionId: id }
      })
      return {
        ...section,
        treeCount
      }
    }

    return section
  }

  // Get section by section code (A1, A2, B3, etc.)
  async findBySectionCode(sectionCode: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
    includePlot?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    if (options?.includePlot) {
      include.plot = true
    }

    const section = await prisma.section.findUnique({
      where: { sectionCode: sectionCode.toUpperCase() },
      include,
    })

    if (!section) return null

    if (options?.includeTreeCount) {
      const treeCount = await prisma.tree.count({
        where: { sectionId: section.id }
      })
      return {
        ...section,
        treeCount
      }
    }

    return section
  }

  // Get sections by plot
  async findByPlot(plotId: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
  }) {
    return this.findMany({ 
      plotId, 
      includeTrees: options?.includeTrees,
      includeTreeCount: options?.includeTreeCount 
    })
  }

  // Get sections by plot code (A, B, C)
  async findByPlotCode(plotCode: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    const sections = await prisma.section.findMany({
      where: { 
        plot: { 
          code: plotCode.toUpperCase() 
        } 
      },
      include: {
        ...include,
        plot: true
      },
      orderBy: { sectionNumber: 'asc' },
    })

    if (options?.includeTreeCount) {
      const sectionsWithCounts = await Promise.all(
        sections.map(async (section) => {
          const treeCount = await prisma.tree.count({
            where: { sectionId: section.id }
          })
          return {
            ...section,
            treeCount
          }
        })
      )
      return sectionsWithCounts
    }

    return sections
  }

  // Create new section
  async create(data: CreateSectionInput) {
    // Get the plot to generate section code
    const plot = await prisma.plot.findUnique({
      where: { id: data.plotId },
      select: { code: true }
    })

    if (!plot) {
      throw new Error('Plot not found')
    }

    // Get next section number for this plot
    const nextSectionNumber = await this.getNextSectionNumber(data.plotId)
    const sectionCode = `${plot.code}${nextSectionNumber}`

    return prisma.section.create({
      data: {
        plotId: data.plotId,
        sectionNumber: nextSectionNumber,
        sectionCode,
        name: data.name,
        description: data.description,
        area: data.area,
        soilType: data.soilType,
      },
      include: {
        plot: true
      }
    })
  }

  // Update section
  async update(id: string, data: UpdateSectionInput) {
    return prisma.section.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        area: data.area,
        soilType: data.soilType,
      },
      include: {
        plot: true
      }
    })
  }

  // Delete section (will cascade delete trees)
  async delete(id: string) {
    return prisma.section.delete({
      where: { id },
    })
  }

  // Get section statistics
  async getStatistics(plotId?: string) {
    const whereClause = plotId ? { plotId } : undefined

    const stats = await prisma.section.findMany({
      where: whereClause,
      select: {
        id: true,
        sectionCode: true,
        name: true,
        area: true,
        plot: {
          select: {
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            trees: true
          }
        }
      },
      orderBy: [
        { plot: { code: 'asc' } },
        { sectionNumber: 'asc' }
      ]
    })

    return stats.map(section => ({
      ...section,
      treeCount: section._count.trees
    }))
  }

  // Get section with tree health summary
  async getHealthSummary(sectionId: string) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        plot: true,
        trees: {
          select: {
            id: true,
            treeCode: true,
            status: true,
            bloomingStatus: true,
            variety: true,
            fruitCount: true
          }
        }
      }
    })

    if (!section) return null

    const healthSummary = {
      totalTrees: section.trees.length,
      aliveTrees: section.trees.filter(t => t.status === 'alive').length,
      deadTrees: section.trees.filter(t => t.status === 'dead').length,
      sickTrees: section.trees.filter(t => t.status === 'sick').length,
      bloomingTrees: section.trees.filter(t => t.bloomingStatus === 'blooming').length,
      notBloomingTrees: section.trees.filter(t => t.bloomingStatus === 'not_blooming').length,
      buddingTrees: section.trees.filter(t => t.bloomingStatus === 'budding').length,
      totalFruits: section.trees.reduce((sum, t) => sum + (t.fruitCount || 0), 0),
      varietyBreakdown: this.getVarietyBreakdown(section.trees)
    }

    return {
      ...section,
      healthSummary
    }
  }

  // Get next available section number for a plot
  async getNextSectionNumber(plotId: string): Promise<number> {
    const lastSection = await prisma.section.findFirst({
      where: { plotId },
      orderBy: { sectionNumber: 'desc' },
      select: { sectionNumber: true }
    })

    return (lastSection?.sectionNumber || 0) + 1
  }

  // Generate section code for a plot
  async generateSectionCode(plotId: string): Promise<string> {
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      select: { code: true }
    })

    if (!plot) {
      throw new Error('Plot not found')
    }

    const nextNumber = await this.getNextSectionNumber(plotId)
    return `${plot.code}${nextNumber}`
  }

  // Get next available tree number for a section
  async getNextTreeNumber(sectionId: string): Promise<number> {
    const lastTree = await prisma.tree.findFirst({
      where: { sectionId },
      orderBy: { treeNumber: 'desc' },
      select: { treeNumber: true }
    })

    return (lastTree?.treeNumber || 0) + 1
  }

  // Generate tree code for a section
  async generateTreeCode(sectionId: string): Promise<string> {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { sectionCode: true }
    })

    if (!section) {
      throw new Error('Section not found')
    }

    const nextNumber = await this.getNextTreeNumber(sectionId)
    return `${section.sectionCode}-T${nextNumber}`
  }

  // Search sections
  async search(query: string) {
    const numericQuery = parseInt(query, 10)
    const searchConditions: any[] = [
      { sectionCode: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { plot: { code: { contains: query, mode: 'insensitive' } } },
      { plot: { name: { contains: query, mode: 'insensitive' } } },
    ]
    
    // Add numeric search for section number if query is a valid number
    if (!isNaN(numericQuery)) {
      searchConditions.push({ sectionNumber: { equals: numericQuery } })
    }
    
    return prisma.section.findMany({
      where: {
        OR: searchConditions,
      },
      include: {
        plot: true,
        _count: {
          select: {
            trees: true
          }
        }
      },
      orderBy: { sectionCode: 'asc' },
    })
  }

  // Private helper methods
  private getVarietyBreakdown(trees: any[]) {
    const varieties: Record<string, number> = {}
    
    trees.forEach(tree => {
      const variety = tree.variety || 'ไม่ระบุ'
      varieties[variety] = (varieties[variety] || 0) + 1
    })

    return Object.entries(varieties).map(([variety, count]) => ({
      variety,
      count
    }))
  }
}