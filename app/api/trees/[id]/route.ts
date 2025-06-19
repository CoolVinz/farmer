import { NextRequest } from 'next/server'
import { treeRepository } from '@/lib/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tree = await treeRepository.findById(id, {
      includeSection: true,
      includeLogs: true
    })

    if (!tree) {
      return Response.json(
        { 
          success: false, 
          error: `Tree ${id} not found` 
        }, 
        { status: 404 }
      )
    }

    return Response.json({
      success: true,
      data: tree
    })
  } catch (error) {
    console.error('Error fetching tree:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch tree details' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { variety, status, bloomingStatus, datePlanted } = body

    const tree = await treeRepository.update(id, {
      variety,
      status,
      bloomingStatus,
      datePlanted
    })

    return Response.json({
      success: true,
      data: tree
    })
  } catch (error) {
    console.error('Error updating tree:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to update tree' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await treeRepository.delete(id)

    return Response.json({
      success: true,
      message: `Tree ${id} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting tree:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to delete tree' 
      }, 
      { status: 500 }
    )
  }
}