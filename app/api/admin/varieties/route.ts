import { NextRequest, NextResponse } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const varieties = await referenceDataRepository.findMany('variety')
    return NextResponse.json(varieties)
  } catch (error) {
    console.error('Error fetching varieties:', error)
    return NextResponse.json({ error: 'Failed to fetch varieties' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check for duplicates
    const nameExists = await referenceDataRepository.nameExists('variety', name.trim())
    if (nameExists) {
      return NextResponse.json({ error: 'รายการนี้มีอยู่แล้ว' }, { status: 409 })
    }

    // Create new variety
    const newVariety = await referenceDataRepository.create('variety', { name: name.trim() })
    return NextResponse.json(newVariety, { status: 201 })
  } catch (error) {
    console.error('Error creating variety:', error)
    return NextResponse.json({ error: 'Failed to create variety' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await referenceDataRepository.delete('variety', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting variety:', error)
    return NextResponse.json({ error: 'Failed to delete variety' }, { status: 500 })
  }
}