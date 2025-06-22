import { prisma } from '../prisma'
import type { BatchLog, Prisma } from '../generated/prisma'

export interface CreateBatchLogData {
  plotId: string
  logDate: Date
  activityId?: string
  notes?: string
}

export interface BatchLogFilters {
  plotId?: string
  plotCode?: string  
  activityId?: string
  dateFrom?: Date
  dateTo?: Date
  skip?: number
  take?: number
}

export class BatchLogRepository {
  async create(data: CreateBatchLogData): Promise<BatchLog> {
    return await prisma.batchLog.create({
      data: {
        plotId: data.plotId,
        logDate: data.logDate,
        activityId: data.activityId || null,
        notes: data.notes || null
      },
      include: {
        activities: true
      }
    })
  }

  async findMany(filters: BatchLogFilters = {}): Promise<BatchLog[]> {
    const where: Prisma.BatchLogWhereInput = {}

    if (filters.plotId) {
      where.plotId = filters.plotId
    }

    if (filters.activityId) {
      where.activityId = filters.activityId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.logDate = {}
      if (filters.dateFrom) {
        where.logDate.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.logDate.lte = filters.dateTo
      }
    }

    return await prisma.batchLog.findMany({
      where,
      include: {
        activities: true
      },
      orderBy: {
        logDate: 'desc'
      },
      skip: filters.skip,
      take: filters.take
    })
  }

  async findById(id: string): Promise<BatchLog | null> {
    return await prisma.batchLog.findUnique({
      where: { id },
      include: {
        activities: true
      }
    })
  }

  async update(id: string, data: Partial<CreateBatchLogData>): Promise<BatchLog> {
    return await prisma.batchLog.update({
      where: { id },
      data: {
        ...(data.plotId && { plotId: data.plotId }),
        ...(data.logDate && { logDate: data.logDate }),
        ...(data.activityId && { activityId: data.activityId }),
        ...(data.notes !== undefined && { notes: data.notes })
      },
      include: {
        activities: true
      }
    })
  }

  async delete(id: string): Promise<BatchLog> {
    return await prisma.batchLog.delete({
      where: { id }
    })
  }

  async count(filters: BatchLogFilters = {}): Promise<number> {
    const where: Prisma.BatchLogWhereInput = {}

    if (filters.plotId) {
      where.plotId = filters.plotId
    }

    if (filters.activityId) {
      where.activityId = filters.activityId
    }

    if (filters.dateFrom || filters.dateTo) {
      where.logDate = {}
      if (filters.dateFrom) {
        where.logDate.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.logDate.lte = filters.dateTo
      }
    }

    return await prisma.batchLog.count({ where })
  }

  async findByPlotCode(plotCode: string, filters: Omit<BatchLogFilters, 'plotCode'> = {}): Promise<BatchLog[]> {
    // First, we need to find plots with the given code
    // Since BatchLog.plotId is just a string (not a proper relation), we need to handle this carefully
    return await prisma.batchLog.findMany({
      where: {
        plotId: plotCode, // Assuming plotId stores the plot code directly
        ...(filters.activityId && { activityId: filters.activityId }),
        ...(filters.dateFrom || filters.dateTo) && {
          logDate: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo })
          }
        }
      },
      include: {
        activities: true
      },
      orderBy: {
        logDate: 'desc'
      },
      skip: filters.skip,
      take: filters.take
    })
  }
}