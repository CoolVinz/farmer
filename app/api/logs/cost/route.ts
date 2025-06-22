import { NextResponse } from 'next/server'
import { treeCostRepository } from '@/lib/repositories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    const activityType = searchParams.get('activityType')
    const target = searchParams.get('target')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    
    const offset = (page - 1) * limit
    
    // Get cost logs with pagination
    const [logs, total] = await Promise.all([
      treeCostRepository.findMany({
        skip: offset,
        take: limit
      }),
      treeCostRepository.count()
    ])
    
    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('Error fetching cost logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cost logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.cost_date || !body.activity_type || !body.target || body.amount === undefined) {
      return NextResponse.json(
        { error: 'cost_date, activity_type, target, and amount are required' },
        { status: 400 }
      )
    }
    
    // Create cost log using TreeCostRepository
    const newLog = await treeCostRepository.create({
      costDate: body.cost_date,
      activityType: body.activity_type,
      target: body.target,
      amount: parseFloat(body.amount),
      notes: body.notes || null
    })
    
    return NextResponse.json({
      success: true,
      data: newLog,
      message: 'Cost log created successfully'
    })
  } catch (error) {
    console.error('Error creating cost log:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create cost log' },
      { status: 500 }
    )
  }
}