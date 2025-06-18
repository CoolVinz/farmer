import { prisma } from '../prisma'
import { CreateTreeInput, UpdateTreeInput } from '../validations'

export class TreeRepository {
  // Get all trees with relations
  async findMany(options?: {
    skip?: number
    take?: number
    include?: {
      logs?: boolean
      variety_ref?: boolean
    }
  }) {
    return prisma.tree.findMany({
      skip: options?.skip,
      take: options?.take,
      include: {
        logs: options?.include?.logs || false,
        variety_ref: options?.include?.variety_ref || false,
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
        variety_ref: true,
      },
    })
  }

  // Get trees by location
  async findByLocation(locationId: string) {
    return prisma.tree.findMany({
      where: { locationId },
      include: { variety_ref: true },
      orderBy: { treeNumber: 'asc' },
    })
  }

  // Create new tree
  async create(data: CreateTreeInput) {
    const treeData = {
      ...data,
      datePlanted: new Date(data.datePlanted),
    }
    
    return prisma.tree.create({
      data: treeData,
      include: { variety_ref: true },
    })
  }

  // Update tree
  async update(id: string, data: UpdateTreeInput) {
    const updateData = {
      ...data,
      ...(data.datePlanted && { datePlanted: new Date(data.datePlanted) }),
    }

    return prisma.tree.update({
      where: { id },
      data: updateData,
      include: { variety_ref: true },
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
    return prisma.tree.findMany({
      where: {
        OR: [
          { treeNumber: { contains: query, mode: 'insensitive' } },
          { locationId: { contains: query, mode: 'insensitive' } },
          { variety: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { variety_ref: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}