import { NextRequest, NextResponse } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    const treeId = searchParams.get('treeId')
    
    const offset = (page - 1) * limit
    
    const options = {
      skip: offset,
      take: limit,
      includeTree: true,
      ...(treeId && { treeId })
    }
    
    const [logs, total] = await Promise.all([
      treeLogRepository.findMany(options),
      treeLogRepository.count(treeId || undefined)
    ])
    
    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('Error fetching single logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch single logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { treeId, logDate, notes, imagePath, activityType, healthStatus, fertilizerType } = body

    if (!treeId || !logDate) {
      return NextResponse.json(
        { error: 'treeId and logDate are required' },
        { status: 400 }
      )
    }

    // Create new log
    const newLog = await treeLogRepository.create({
      treeId,
      logDate,
      notes: notes || undefined,
      imagePath: imagePath || undefined,
      activityType: activityType || undefined,
      healthStatus: healthStatus || undefined,
      fertilizerType: fertilizerType || undefined,
    })

    return NextResponse.json(newLog, { status: 201 })
  } catch (error) {
    console.error('Error creating tree log:', error)
    return NextResponse.json(
      { error: 'Failed to create tree log' },
      { status: 500 }
    )
  }
}