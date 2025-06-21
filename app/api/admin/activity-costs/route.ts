import { NextRequest, NextResponse } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const activityCosts = await referenceDataRepository.findMany('activityCost')
    return NextResponse.json(activityCosts)
  } catch (error) {
    console.error('Error fetching activity costs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity costs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const nameExists = await referenceDataRepository.nameExists('activityCost', name.trim())
    if (nameExists) {
      return NextResponse.json({ error: 'รายการนี้มีอยู่แล้ว' }, { status: 409 })
    }

    const newActivityCost = await referenceDataRepository.create('activityCost', { name: name.trim() })
    return NextResponse.json(newActivityCost, { status: 201 })
  } catch (error) {
    console.error('Error creating activity cost:', error)
    return NextResponse.json({ error: 'Failed to create activity cost' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await referenceDataRepository.delete('activityCost', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity cost:', error)
    return NextResponse.json({ error: 'Failed to delete activity cost' }, { status: 500 })
  }
}