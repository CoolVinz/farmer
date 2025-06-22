import { NextResponse } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    
    const offset = (page - 1) * limit
    
    // For now, use tree log repository with proper parameters
    const [logs, total] = await Promise.all([
      treeLogRepository.findMany({
        skip: offset,
        take: limit
      }),
      treeLogRepository.count()
    ])
    
    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('Error fetching batch logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch batch logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create batch log - simplified structure for now
    const newLog = await treeLogRepository.create({
      treeId: body.plot_id, // Using treeId field for plot_id
      logDate: new Date(body.log_date),
      activityType: body.activity_id,
      notes: body.notes,
      fertilizerType: body.fertilizer_name
    })
    
    return NextResponse.json(newLog)
  } catch (error) {
    console.error('Error creating batch log:', error)
    return NextResponse.json(
      { error: 'Failed to create batch log' },
      { status: 500 }
    )
  }
}