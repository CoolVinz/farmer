import { NextResponse } from 'next/server'
import { batchLogRepository } from '@/lib/repositories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    const plotId = searchParams.get('plotId')
    const plotCode = searchParams.get('plotCode')
    const activityId = searchParams.get('activityId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    const offset = (page - 1) * limit
    
    const filters = {
      ...(plotId && { plotId }),
      ...(plotCode && { plotCode }),
      ...(activityId && { activityId }),
      ...(dateFrom && { dateFrom: new Date(dateFrom) }),
      ...(dateTo && { dateTo: new Date(dateTo) }),
      skip: offset,
      take: limit
    }
    
    const [logs, total] = await Promise.all([
      batchLogRepository.findMany(filters),
      batchLogRepository.count(filters)
    ])
    
    return NextResponse.json({ 
      success: true,
      data: logs, 
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching batch logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batch logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.plot_id) {
      return NextResponse.json(
        { success: false, error: 'Plot ID is required' },
        { status: 400 }
      )
    }
    
    if (!body.log_date) {
      return NextResponse.json(
        { success: false, error: 'Log date is required' },
        { status: 400 }
      )
    }
    
    // Create batch log with proper data mapping
    const newLog = await batchLogRepository.create({
      plotId: body.plot_id,
      logDate: new Date(body.log_date),
      activityId: body.activity_id || undefined,
      notes: body.notes || undefined
    })
    
    return NextResponse.json({ 
      success: true, 
      data: newLog,
      message: 'Batch log created successfully'
    })
  } catch (error) {
    console.error('Error creating batch log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create batch log' },
      { status: 500 }
    )
  }
}