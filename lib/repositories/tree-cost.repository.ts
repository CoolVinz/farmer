import { prisma } from '../prisma'
import { CreateCostInput, UpdateCostInput } from '../validations'

export class TreeCostRepository {
  // Get all tree costs
  async findMany(options?: {
    skip?: number
    take?: number
  }) {
    return prisma.treeCost.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: { costDate: 'desc' },
    })
  }

  // Get cost by ID
  async findById(id: string) {
    return prisma.treeCost.findUnique({
      where: { id },
    })
  }

  // Create new cost record
  async create(data: CreateCostInput) {
    const costData = {
      ...data,
      costDate: new Date(data.costDate),
    }
    
    return prisma.treeCost.create({
      data: costData,
    })
  }

  // Update cost record
  async update(id: string, data: UpdateCostInput) {
    const updateData: any = {}
    
    if (data.costDate) updateData.costDate = new Date(data.costDate)
    if (data.activityType) updateData.activityType = data.activityType
    if (data.target) updateData.target = data.target
    if (data.amount !== undefined) updateData.amount = data.amount
    if (data.notes !== undefined) updateData.notes = data.notes

    return prisma.treeCost.update({
      where: { id },
      data: updateData,
    })
  }

  // Delete cost record
  async delete(id: string) {
    return prisma.treeCost.delete({
      where: { id },
    })
  }

  // Get cost count
  async count() {
    return prisma.treeCost.count()
  }

  // Get monthly revenue calculation
  async getMonthlyRevenue() {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const endOfMonth = new Date(startOfMonth)
    endOfMonth.setMonth(endOfMonth.getMonth() + 1)

    const result = await prisma.treeCost.aggregate({
      where: {
        costDate: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    })

    return result._sum.amount || 0
  }

  // Get cost distribution by activity type
  async getCostDistribution() {
    const result = await prisma.treeCost.groupBy({
      by: ['activityType'],
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } }
    })
    
    return result.map(item => ({
      activityType: item.activityType,
      totalAmount: item._sum.amount || 0,
      count: item._count.id,
    }))
  }

  // Get monthly trend data (last 6 months)
  async getMonthlyTrend() {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const costs = await prisma.treeCost.findMany({
      where: {
        costDate: { gte: sixMonthsAgo }
      },
      select: {
        costDate: true,
        amount: true
      },
      orderBy: { costDate: 'asc' }
    })

    // Group by month
    const monthlyData = new Map<string, number>()
    costs.forEach(cost => {
      const monthKey = cost.costDate.toISOString().substring(0, 7) // YYYY-MM
      const current = monthlyData.get(monthKey) || 0
      monthlyData.set(monthKey, current + Number(cost.amount))
    })

    return Array.from(monthlyData.entries()).map(([month, amount]) => ({
      month,
      amount
    }))
  }

  // Search costs
  async search(query: string) {
    return prisma.treeCost.findMany({
      where: {
        OR: [
          { activityType: { contains: query, mode: 'insensitive' } },
          { target: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { costDate: 'desc' },
    })
  }
}