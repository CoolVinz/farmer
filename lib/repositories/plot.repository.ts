import { prisma } from '../prisma'

export interface CreatePlotInput {
  code: string
  name: string
  owner?: string
  area?: number
  sectionSpacing?: 'FOUR_BY_FOUR' | 'TEN_BY_TEN'
  soilType?: string
  description?: string
}

export interface UpdatePlotInput {
  name?: string
  owner?: string
  area?: number
  sectionSpacing?: 'FOUR_BY_FOUR' | 'TEN_BY_TEN'
  soilType?: string
  description?: string
}

export class PlotRepository {
  // Get all plots with optional tree counts
  async findMany(options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    const plots = await prisma.plot.findMany({
      include,
      orderBy: { code: 'asc' },
    })

    if (options?.includeTreeCount) {
      // Add tree counts to each plot
      const plotsWithCounts = await Promise.all(
        plots.map(async (plot) => {
          const treeCount = await prisma.tree.count({
            where: { 
              section: {
                plotId: plot.id
              }
            }
          })
          return {
            ...plot,
            treeCount
          }
        })
      )
      return plotsWithCounts
    }

    return plots
  }

  // Get plot by ID
  async findById(id: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    const plot = await prisma.plot.findUnique({
      where: { id },
      include,
    })

    if (!plot) return null

    if (options?.includeTreeCount) {
      const treeCount = await prisma.tree.count({
        where: { 
          section: {
            plotId: id
          }
        }
      })
      return {
        ...plot,
        treeCount
      }
    }

    return plot
  }

  // Get plot by code (A, B, C)
  async findByCode(code: string, options?: {
    includeTrees?: boolean
    includeTreeCount?: boolean
  }) {
    const include: any = {}
    
    if (options?.includeTrees) {
      include.trees = {
        orderBy: { treeNumber: 'asc' }
      }
    }

    const plot = await prisma.plot.findUnique({
      where: { code: code.toUpperCase() },
      include,
    })

    if (!plot) return null

    if (options?.includeTreeCount) {
      const treeCount = await prisma.tree.count({
        where: { 
          section: {
            plotId: plot.id
          }
        }
      })
      return {
        ...plot,
        treeCount
      }
    }

    return plot
  }

  // Create new plot
  async create(data: CreatePlotInput) {
    return prisma.plot.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        owner: data.owner,
        area: data.area,
        sectionSpacing: data.sectionSpacing || 'FOUR_BY_FOUR',
        soilType: data.soilType,
        description: data.description,
      }
    })
  }

  // Update plot
  async update(id: string, data: UpdatePlotInput) {
    return prisma.plot.update({
      where: { id },
      data: {
        name: data.name,
        owner: data.owner,
        area: data.area,
        sectionSpacing: data.sectionSpacing,
        soilType: data.soilType,
        description: data.description,
      }
    })
  }

  // Delete plot (will cascade delete trees and logs)
  async delete(id: string) {
    return prisma.plot.delete({
      where: { id },
    })
  }

  // Get plot statistics
  async getStatistics() {
    const stats = await prisma.plot.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        area: true,
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })

    return stats.map(plot => ({
      ...plot,
      sectionCount: plot._count.sections
    }))
  }

  // Get plot with tree health summary
  async getHealthSummary(plotId: string) {
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: {
        sections: {
          include: {
            trees: {
              select: {
                id: true,
                treeCode: true,
                status: true,
                variety: true,
                fruitCount: true
              }
            }
          }
        }
      }
    })

    if (!plot) return null

    // Flatten trees from all sections
    const allTrees = plot.sections.flatMap(section => section.trees)

    const healthSummary = {
      totalTrees: allTrees.length,
      aliveTrees: allTrees.filter(t => t.status === 'alive').length,
      deadTrees: allTrees.filter(t => t.status === 'dead').length,
      sickTrees: allTrees.filter(t => t.status === 'sick').length,
      totalFruits: allTrees.reduce((sum, t) => sum + (t.fruitCount || 0), 0),
      varietyBreakdown: this.getVarietyBreakdown(allTrees)
    }

    return {
      ...plot,
      healthSummary
    }
  }

  // Get next available tree number for a plot
  async getNextTreeNumber(plotId: string): Promise<number> {
    const lastTree = await prisma.tree.findFirst({
      where: { 
        section: {
          plotId 
        }
      },
      orderBy: { treeNumber: 'desc' },
      select: { treeNumber: true }
    })

    return (lastTree?.treeNumber || 0) + 1
  }

  // Generate tree code for a plot
  async generateTreeCode(plotId: string): Promise<string> {
    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      select: { code: true }
    })

    if (!plot) {
      throw new Error('Plot not found')
    }

    const nextNumber = await this.getNextTreeNumber(plotId)
    return `${plot.code}${nextNumber}`
  }

  // Get plots with recent activity
  async getPlotsWithRecentActivity(days: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return prisma.plot.findMany({
      where: {
        sections: {
          some: {
            trees: {
              some: {
                logs: {
                  some: {
                    logDate: { gte: cutoffDate }
                  }
                }
              }
            }
          }
        }
      },
      include: {
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: { code: 'asc' }
    })
  }

  // Get tree count for a specific plot
  async getTreeCountForPlot(plotId: string): Promise<number> {
    const treeCount = await prisma.tree.count({
      where: {
        section: {
          plotId: plotId
        }
      }
    })
    return treeCount
  }

  // Calculate section coordinates based on plot spacing
  calculateSectionCoordinates(sectionNumber: number, spacing: 'FOUR_BY_FOUR' | 'TEN_BY_TEN', plotLayout?: { rows: number, cols: number }) {
    const spacingMeters = spacing === 'FOUR_BY_FOUR' ? 4 : 10
    const layout = plotLayout || { rows: 10, cols: 10 } // Default 10x10 grid
    
    // Convert section number to row/col (1-based to 0-based)
    const row = Math.floor((sectionNumber - 1) / layout.cols)
    const col = (sectionNumber - 1) % layout.cols
    
    return {
      xCoordinate: col * spacingMeters,
      yCoordinate: row * spacingMeters
    }
  }

  // Get spacing in meters for a plot
  getSpacingMeters(spacing: 'FOUR_BY_FOUR' | 'TEN_BY_TEN'): number {
    return spacing === 'FOUR_BY_FOUR' ? 4 : 10
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