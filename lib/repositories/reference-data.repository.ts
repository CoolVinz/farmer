import { prisma } from '../prisma'
import { CreateReferenceDataInput, UpdateReferenceDataInput } from '../validations'

export class ReferenceDataRepository {
  // Get all items of a specific type
  async findMany(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost') {
    switch (type) {
      case 'variety':
        return prisma.variety.findMany({ orderBy: { name: 'asc' } })
      case 'fertilizer':
        return prisma.fertilizer.findMany({ orderBy: { name: 'asc' } })
      case 'pesticide':
        return prisma.pesticide.findMany({ orderBy: { name: 'asc' } })
      case 'plantDisease':
        return prisma.plantDisease.findMany({ orderBy: { name: 'asc' } })
      case 'activity':
        return prisma.activity.findMany({ orderBy: { name: 'asc' } })
      case 'activityCost':
        return prisma.activityCost.findMany({ orderBy: { name: 'asc' } })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Get item by ID
  async findById(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string) {
    switch (type) {
      case 'variety':
        return prisma.variety.findUnique({ where: { id } })
      case 'fertilizer':
        return prisma.fertilizer.findUnique({ where: { id } })
      case 'pesticide':
        return prisma.pesticide.findUnique({ where: { id } })
      case 'plantDisease':
        return prisma.plantDisease.findUnique({ where: { id } })
      case 'activity':
        return prisma.activity.findUnique({ where: { id } })
      case 'activityCost':
        return prisma.activityCost.findUnique({ where: { id } })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Get item by name
  async findByName(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', name: string) {
    switch (type) {
      case 'variety':
        return prisma.variety.findUnique({ where: { name } })
      case 'fertilizer':
        return prisma.fertilizer.findUnique({ where: { name } })
      case 'pesticide':
        return prisma.pesticide.findUnique({ where: { name } })
      case 'plantDisease':
        return prisma.plantDisease.findUnique({ where: { name } })
      case 'activity':
        return prisma.activity.findUnique({ where: { name } })
      case 'activityCost':
        return prisma.activityCost.findUnique({ where: { name } })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Create new item
  async create(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', data: CreateReferenceDataInput) {
    switch (type) {
      case 'variety':
        return prisma.variety.create({ data })
      case 'fertilizer':
        return prisma.fertilizer.create({ data })
      case 'pesticide':
        return prisma.pesticide.create({ data })
      case 'plantDisease':
        return prisma.plantDisease.create({ data })
      case 'activity':
        return prisma.activity.create({ data })
      case 'activityCost':
        return prisma.activityCost.create({ data })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Update item
  async update(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string, data: UpdateReferenceDataInput) {
    switch (type) {
      case 'variety':
        return prisma.variety.update({ where: { id }, data })
      case 'fertilizer':
        return prisma.fertilizer.update({ where: { id }, data })
      case 'pesticide':
        return prisma.pesticide.update({ where: { id }, data })
      case 'plantDisease':
        return prisma.plantDisease.update({ where: { id }, data })
      case 'activity':
        return prisma.activity.update({ where: { id }, data })
      case 'activityCost':
        return prisma.activityCost.update({ where: { id }, data })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Delete item
  async delete(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string) {
    switch (type) {
      case 'variety':
        return prisma.variety.delete({ where: { id } })
      case 'fertilizer':
        return prisma.fertilizer.delete({ where: { id } })
      case 'pesticide':
        return prisma.pesticide.delete({ where: { id } })
      case 'plantDisease':
        return prisma.plantDisease.delete({ where: { id } })
      case 'activity':
        return prisma.activity.delete({ where: { id } })
      case 'activityCost':
        return prisma.activityCost.delete({ where: { id } })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Get count
  async count(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost') {
    switch (type) {
      case 'variety':
        return prisma.variety.count()
      case 'fertilizer':
        return prisma.fertilizer.count()
      case 'pesticide':
        return prisma.pesticide.count()
      case 'plantDisease':
        return prisma.plantDisease.count()
      case 'activity':
        return prisma.activity.count()
      case 'activityCost':
        return prisma.activityCost.count()
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Search items
  async search(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', query: string) {
    switch (type) {
      case 'variety':
        return prisma.variety.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      case 'fertilizer':
        return prisma.fertilizer.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      case 'pesticide':
        return prisma.pesticide.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      case 'plantDisease':
        return prisma.plantDisease.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      case 'activity':
        return prisma.activity.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      case 'activityCost':
        return prisma.activityCost.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          orderBy: { name: 'asc' }
        })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Bulk operations
  async createMany(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', data: CreateReferenceDataInput[]) {
    switch (type) {
      case 'variety':
        return prisma.variety.createMany({ data, skipDuplicates: true })
      case 'fertilizer':
        return prisma.fertilizer.createMany({ data, skipDuplicates: true })
      case 'pesticide':
        return prisma.pesticide.createMany({ data, skipDuplicates: true })
      case 'plantDisease':
        return prisma.plantDisease.createMany({ data, skipDuplicates: true })
      case 'activity':
        return prisma.activity.createMany({ data, skipDuplicates: true })
      case 'activityCost':
        return prisma.activityCost.createMany({ data, skipDuplicates: true })
      default:
        throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Check if name exists
  async nameExists(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', name: string, excludeId?: string) {
    const existing = await this.findByName(type, name)
    
    if (!existing) return false
    if (excludeId && existing.id === excludeId) return false
    
    return true
  }
}