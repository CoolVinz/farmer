import { NextRequest } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { treeId, logDate, activityType, notes, healthStatus, fertilizerType } = body

    if (!treeId || !logDate) {
      return Response.json(
        { 
          success: false, 
          error: 'Tree ID and log date are required' 
        }, 
        { status: 400 }
      )
    }

    const logData = {
      treeId,
      logDate: new Date(logDate),
      activityType,
      notes,
      healthStatus,
      fertilizerType
    }

    const newLog = await treeLogRepository.create(logData)

    return Response.json({
      success: true,
      data: newLog
    })
  } catch (error) {
    console.error('Error creating tree log:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to create tree log' 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const treeId = searchParams.get('treeId')
    const activityType = searchParams.get('activityType')

    let logs
    if (treeId) {
      logs = await treeLogRepository.findMany({ treeId, includeTree: true })
    } else {
      logs = await treeLogRepository.findMany({ includeTree: true })
    }
    
    // Filter by activity type if specified
    if (activityType) {
      logs = logs.filter(log => log.activityType === activityType)
    }

    return Response.json({
      success: true,
      data: logs
    })
  } catch (error) {
    console.error('Error fetching tree logs:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch tree logs' 
      }, 
      { status: 500 }
    )
  }
}