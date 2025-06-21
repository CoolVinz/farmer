import { NextRequest, NextResponse } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const fertilizers = await referenceDataRepository.findMany('fertilizer')
    return NextResponse.json(fertilizers)
  } catch (error) {
    console.error('Error fetching fertilizers:', error)
    return NextResponse.json({ error: 'Failed to fetch fertilizers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const nameExists = await referenceDataRepository.nameExists('fertilizer', name.trim())
    if (nameExists) {
      return NextResponse.json({ error: 'รายการนี้มีอยู่แล้ว' }, { status: 409 })
    }

    const newFertilizer = await referenceDataRepository.create('fertilizer', { name: name.trim() })
    return NextResponse.json(newFertilizer, { status: 201 })
  } catch (error) {
    console.error('Error creating fertilizer:', error)
    return NextResponse.json({ error: 'Failed to create fertilizer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await referenceDataRepository.delete('fertilizer', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fertilizer:', error)
    return NextResponse.json({ error: 'Failed to delete fertilizer' }, { status: 500 })
  }
}