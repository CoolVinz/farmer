// Hybrid repository that works with both Supabase and Prisma
import { supabase } from '../supabase'
import { CreateReferenceDataInput, UpdateReferenceDataInput } from '../validations'

export class HybridReferenceDataRepository {
  // Generic methods for all reference data types using Supabase for now
  private getTableName(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost'): string {
    switch (type) {
      case 'variety': return 'varieties'
      case 'fertilizer': return 'fertilizers'
      case 'pesticide': return 'pesticides'
      case 'plantDisease': return 'plant_diseases'
      case 'activity': return 'activities'
      case 'activityCost': return 'activities_cost'
      default: throw new Error(`Unknown reference data type: ${type}`)
    }
  }

  // Get all items of a specific type
  async findMany(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost') {
    const tableName = this.getTableName(type)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch ${type}: ${error.message}`)
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at ? new Date(item.created_at) : new Date()
    })) || []
  }

  // Get item by ID
  async findById(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string) {
    const tableName = this.getTableName(type)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch ${type} by id: ${error.message}`)
    }

    return data ? {
      id: data.id,
      name: data.name,
      createdAt: data.created_at ? new Date(data.created_at) : new Date()
    } : null
  }

  // Get item by name
  async findByName(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', name: string) {
    const tableName = this.getTableName(type)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch ${type} by name: ${error.message}`)
    }

    return data ? {
      id: data.id,
      name: data.name,
      createdAt: data.created_at ? new Date(data.created_at) : new Date()
    } : null
  }

  // Create new item
  async create(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', data: CreateReferenceDataInput) {
    const tableName = this.getTableName(type)
    const { data: result, error } = await supabase
      .from(tableName)
      .insert([{ name: data.name }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ${type}: ${error.message}`)
    }

    return {
      id: result.id,
      name: result.name,
      createdAt: result.created_at ? new Date(result.created_at) : new Date()
    }
  }

  // Update item
  async update(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string, data: UpdateReferenceDataInput) {
    const tableName = this.getTableName(type)
    const { data: result, error } = await supabase
      .from(tableName)
      .update({ name: data.name })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ${type}: ${error.message}`)
    }

    return {
      id: result.id,
      name: result.name,
      createdAt: result.created_at ? new Date(result.created_at) : new Date()
    }
  }

  // Delete item
  async delete(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', id: string) {
    const tableName = this.getTableName(type)
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ${type}: ${error.message}`)
    }

    return true
  }

  // Get count
  async count(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost') {
    const tableName = this.getTableName(type)
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (error) {
      throw new Error(`Failed to count ${type}: ${error.message}`)
    }

    return count || 0
  }

  // Search items
  async search(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', query: string) {
    const tableName = this.getTableName(type)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to search ${type}: ${error.message}`)
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at ? new Date(item.created_at) : new Date()
    })) || []
  }

  // Check if name exists
  async nameExists(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', name: string, excludeId?: string) {
    const tableName = this.getTableName(type)
    let query = supabase
      .from(tableName)
      .select('id')
      .eq('name', name)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to check if ${type} name exists: ${error.message}`)
    }

    return data && data.length > 0
  }

  // Bulk operations
  async createMany(type: 'variety' | 'fertilizer' | 'pesticide' | 'plantDisease' | 'activity' | 'activityCost', data: CreateReferenceDataInput[]) {
    const tableName = this.getTableName(type)
    const insertData = data.map(item => ({ name: item.name }))
    
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()

    if (error) {
      throw new Error(`Failed to bulk create ${type}: ${error.message}`)
    }

    return {
      count: result?.length || 0
    }
  }
}