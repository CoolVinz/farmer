import { prisma } from '../prisma'
import { CreateTreeLogInput, UpdateTreeLogInput } from '../validations'

export class TreeLogRepository {
  // Get all tree logs with relations
  async findMany(options?: {
    skip?: number
    take?: number
    treeId?: string
    includeTree?: boolean
  }) {
    return prisma.treeLog.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.treeId ? { treeId: options.treeId } : undefined,
      include: {
        tree: options?.includeTree || false,
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Get log by ID
  async findById(id: string) {
    return prisma.treeLog.findUnique({
      where: { id },
      include: {
        tree: true,
      },
    })
  }

  // Get logs with images
  async findWithImages(options?: { skip?: number; take?: number }) {
    return prisma.treeLog.findMany({
      where: {
        imagePath: { not: null },
      },
      skip: options?.skip,
      take: options?.take,
      include: {
        tree: true,
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Get all logs with images for gallery
  async findManyWithImages() {
    return prisma.treeLog.findMany({
      where: {
        imagePath: { not: null },
      },
      include: {
        tree: true,
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Create new log
  async create(data: CreateTreeLogInput) {
    const logData = {
      ...data,
      logDate: new Date(data.logDate),
    }
    
    return prisma.treeLog.create({
      data: logData,
      include: {
        tree: true,
      },
    })
  }

  // Update log
  async update(id: string, data: UpdateTreeLogInput) {
    const updateData = {
      ...data,
      ...(data.logDate && { logDate: new Date(data.logDate) }),
    }

    return prisma.treeLog.update({
      where: { id },
      data: updateData,
      include: {
        tree: true,
      },
    })
  }

  // Delete log
  async delete(id: string) {
    return prisma.treeLog.delete({
      where: { id },
    })
  }

  // Get log count
  async count(treeId?: string) {
    return prisma.treeLog.count({
      where: treeId ? { treeId } : undefined,
    })
  }

  // Get recent activity
  async getRecentActivity(limit = 1) {
    return prisma.treeLog.findMany({
      take: limit,
      include: {
        tree: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Get logs by date range
  async findByDateRange(startDate: Date, endDate: Date) {
    return prisma.treeLog.findMany({
      where: {
        logDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tree: true,
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Search logs
  async search(query: string) {
    return prisma.treeLog.findMany({
      where: {
        OR: [
          { notes: { contains: query, mode: 'insensitive' } },
          { activityType: { contains: query, mode: 'insensitive' } },
          { tree: { 
            OR: [
              { treeCode: { contains: query, mode: 'insensitive' } },
              { variety: { contains: query, mode: 'insensitive' } },
              { section: { plot: { code: { contains: query, mode: 'insensitive' } } } },
              { section: { plot: { name: { contains: query, mode: 'insensitive' } } } },
            ]
          }},
        ],
      },
      include: {
        tree: {
          include: {
            section: {
              include: {
                plot: true
              }
            }
          }
        },
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Get activity distribution for dashboard
  async getActivityDistribution() {
    const result = await prisma.treeLog.groupBy({
      by: ['activityType'],
      _count: { id: true },
      where: { 
        activityType: { not: null }
      },
      orderBy: { _count: { id: 'desc' } }
    })
    
    return result.map(item => ({
      activityType: item.activityType || 'ไม่ระบุ',
      count: item._count.id,
    }))
  }

  // Get monthly log trend (last 6 months)
  async getMonthlyLogTrend() {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const logs = await prisma.treeLog.findMany({
      where: {
        logDate: { gte: sixMonthsAgo }
      },
      select: {
        logDate: true,
        activityType: true
      },
      orderBy: { logDate: 'asc' }
    })

    // Group by month
    const monthlyData = new Map<string, number>()
    logs.forEach(log => {
      const monthKey = log.logDate.toISOString().substring(0, 7) // YYYY-MM
      const current = monthlyData.get(monthKey) || 0
      monthlyData.set(monthKey, current + 1)
    })

    return Array.from(monthlyData.entries()).map(([month, count]) => ({
      month,
      count
    }))
  }

  // Get health status distribution
  async getHealthStatusDistribution() {
    const result = await prisma.treeLog.groupBy({
      by: ['healthStatus'],
      _count: { id: true },
      where: { 
        healthStatus: { not: null }
      },
      orderBy: { _count: { id: 'desc' } }
    })
    
    return result.map(item => ({
      healthStatus: item.healthStatus || 'ไม่ระบุ',
      count: item._count.id,
    }))
  }
}