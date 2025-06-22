import { NextRequest, NextResponse } from 'next/server'
import { plotRepository } from '@/lib/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const plot = await plotRepository.findById(id, {
      includeTreeCount: true
    })

    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: plot
    })
  } catch (error) {
    console.error('Error fetching plot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plot' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    
    const plot = await plotRepository.update(id, {
      name: body.name,
      owner: body.owner,
      area: body.area,
      sectionSpacing: body.sectionSpacing,
      soilType: body.soilType,
      description: body.description
    })

    return NextResponse.json({
      success: true,
      data: plot
    })
  } catch (error) {
    console.error('Error updating plot:', error)
    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await plotRepository.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Plot deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting plot:', error)
    return NextResponse.json(
      { error: 'Failed to delete plot' },
      { status: 500 }
    )
  }
}