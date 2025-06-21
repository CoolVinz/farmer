import { NextRequest, NextResponse } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const diseases = await referenceDataRepository.findMany('plantDisease')
    return NextResponse.json(diseases)
  } catch (error) {
    console.error('Error fetching diseases:', error)
    return NextResponse.json({ error: 'Failed to fetch diseases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const nameExists = await referenceDataRepository.nameExists('plantDisease', name.trim())
    if (nameExists) {
      return NextResponse.json({ error: 'รายการนี้มีอยู่แล้ว' }, { status: 409 })
    }

    const newDisease = await referenceDataRepository.create('plantDisease', { name: name.trim() })
    return NextResponse.json(newDisease, { status: 201 })
  } catch (error) {
    console.error('Error creating disease:', error)
    return NextResponse.json({ error: 'Failed to create disease' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await referenceDataRepository.delete('plantDisease', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting disease:', error)
    return NextResponse.json({ error: 'Failed to delete disease' }, { status: 500 })
  }
}