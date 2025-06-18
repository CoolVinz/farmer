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
        tree: options?.includeTree ? {
          include: { variety_ref: true }
        } : false,
      },
      orderBy: { logDate: 'desc' },
    })
  }

  // Get log by ID
  async findById(id: string) {
    return prisma.treeLog.findUnique({
      where: { id },
      include: {
        tree: { include: { variety_ref: true } },
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
        tree: { include: { variety_ref: true } },
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
        tree: { include: { variety_ref: true } },
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
        tree: { include: { variety_ref: true } },
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
        tree: { include: { variety_ref: true } },
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
              { treeNumber: { contains: query, mode: 'insensitive' } },
              { locationId: { contains: query, mode: 'insensitive' } },
            ]
          }},
        ],
      },
      include: {
        tree: { include: { variety_ref: true } },
      },
      orderBy: { logDate: 'desc' },
    })
  }
}