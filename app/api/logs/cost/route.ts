import { NextResponse } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '8', 10)
    
    const offset = (page - 1) * limit
    
    // For now, return empty array - cost tracking needs dedicated implementation
    const logs: any[] = [];
    const total = 0;
    
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
    
    // Cost log creation - simplified for now
    const newLog = {
      id: Date.now().toString(),
      cost_date: body.cost_date,
      activity_type: body.activity_type,
      amount: parseFloat(body.amount),
      notes: body.notes
    }
    
    return NextResponse.json(newLog)
  } catch (error) {
    console.error('Error creating cost log:', error)
    return NextResponse.json(
      { error: 'Failed to create cost log' },
      { status: 500 }
    )
  }
}