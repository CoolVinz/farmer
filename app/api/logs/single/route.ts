import { NextRequest, NextResponse } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

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