import { NextResponse } from 'next/server'
import { TreeRepository } from '@/lib/repositories/tree.repository'
import { TreeLogRepository } from '@/lib/repositories/tree-log.repository'
import { TreeCostRepository } from '@/lib/repositories/tree-cost.repository'

export interface DashboardStats {
  totalTrees: number
  totalLogs: number
  totalCosts: number
  totalVarieties: number
  recentActivity: string
  monthlyYield: number
  healthyTrees: number
  monthlyRevenue: number
  varietyDistribution: { variety: string; count: number }[]
  activityDistribution: { activityType: string; count: number }[]
  monthlyTrend: { month: string; amount: number }[]
  lastUpdateTime: string
}

// Helper function to estimate weight per fruit based on durian variety
function getWeightPerFruit(variety: string | null): number {
  const varietyWeights: Record<string, number> = {
    'หมอนทอง': 2.5,
    'ชะนี': 3.0,
    'กันยาว': 2.8,
    'กระดุม': 1.5,
    'ไผ่ทอง': 2.2
  }
  return varietyWeights[variety || ''] || 2.5 // Default 2.5 kg per durian
}

export async function GET() {
  try {
    // Initialize repositories
    const treeRepo = new TreeRepository()
    const treeLogRepo = new TreeLogRepository()
    const treeCostRepo = new TreeCostRepository()

    // Fetch all data in parallel
    const results = await Promise.allSettled([
      treeRepo.count(),
      treeLogRepo.count(),
      treeCostRepo.count(),
      treeRepo.getVarietyDistribution(),
      treeLogRepo.getRecentActivity(1),
      treeRepo.getHealthyTreesCount(),
      treeRepo.getMonthlyYieldData(),
      treeCostRepo.getMonthlyRevenue(),
      treeLogRepo.getActivityDistribution(),
      treeCostRepo.getMonthlyTrend()
    ])

    const totalTrees = results[0].status === 'fulfilled' ? results[0].value : 0
    const totalLogs = results[1].status === 'fulfilled' ? results[1].value : 0
    const totalCosts = results[2].status === 'fulfilled' ? results[2].value : 0
    const varietyDistribution = results[3].status === 'fulfilled' ? results[3].value : []
    const recentActivity = results[4].status === 'fulfilled' && results[4].value.length > 0 
      ? results[4].value[0].activityType || 'ยังไม่มีกิจกรรม'
      : 'ยังไม่มีกิจกรรม'
    const healthyTrees = results[5].status === 'fulfilled' ? results[5].value : 0
    const yieldData = results[6].status === 'fulfilled' ? results[6].value : []
    const monthlyRevenue = results[7].status === 'fulfilled' ? Number(results[7].value) : 0
    const activityDistribution = results[8].status === 'fulfilled' ? results[8].value : []
    const monthlyTrend = results[9].status === 'fulfilled' ? results[9].value : []

    // Calculate realistic monthly yield based on actual fruit count data
    const monthlyYield = yieldData.reduce((total, tree) => {
      const fruitCount = tree.fruitCount || 0
      // Estimate kg per fruit based on durian variety (much heavier than mango)
      const weightPerFruit = getWeightPerFruit(tree.variety)
      return total + (fruitCount * weightPerFruit)
    }, 0)

    // Get last update time from recent activity
    const lastUpdateTime = results[4].status === 'fulfilled' && results[4].value.length > 0 && results[4].value[0].createdAt
      ? new Date(results[4].value[0].createdAt).toLocaleString('th-TH')
      : 'ไม่มีกิจกรรม'

    const stats: DashboardStats = {
      totalTrees,
      totalLogs,
      totalCosts,
      totalVarieties: varietyDistribution.length,
      recentActivity,
      monthlyYield: Math.round(monthlyYield),
      healthyTrees,
      monthlyRevenue,
      varietyDistribution,
      activityDistribution,
      monthlyTrend,
      lastUpdateTime
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    
    // Return default values on error
    const defaultStats: DashboardStats = {
      totalTrees: 0,
      totalLogs: 0,
      totalCosts: 0,
      totalVarieties: 0,
      recentActivity: 'ไม่สามารถโหลดข้อมูลได้',
      monthlyYield: 0,
      healthyTrees: 0,
      monthlyRevenue: 0,
      varietyDistribution: [],
      activityDistribution: [],
      monthlyTrend: [],
      lastUpdateTime: 'ไม่สามารถโหลดข้อมูลได้'
    }

    return NextResponse.json(defaultStats, { status: 500 })
  }
}