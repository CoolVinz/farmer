import { NextRequest, NextResponse } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const pesticides = await referenceDataRepository.findMany('pesticide')
    return NextResponse.json(pesticides)
  } catch (error) {
    console.error('Error fetching pesticides:', error)
    return NextResponse.json({ error: 'Failed to fetch pesticides' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const nameExists = await referenceDataRepository.nameExists('pesticide', name.trim())
    if (nameExists) {
      return NextResponse.json({ error: 'รายการนี้มีอยู่แล้ว' }, { status: 409 })
    }

    const newPesticide = await referenceDataRepository.create('pesticide', { name: name.trim() })
    return NextResponse.json(newPesticide, { status: 201 })
  } catch (error) {
    console.error('Error creating pesticide:', error)
    return NextResponse.json({ error: 'Failed to create pesticide' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await referenceDataRepository.delete('pesticide', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pesticide:', error)
    return NextResponse.json({ error: 'Failed to delete pesticide' }, { status: 500 })
  }
}