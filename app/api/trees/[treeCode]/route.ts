import { NextRequest } from 'next/server'
import { treeRepository } from '@/lib/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ treeCode: string }> }
) {
  try {
    const { treeCode } = await params

    const tree = await treeRepository.findByTreeCode(treeCode)

    if (!tree) {
      return Response.json(
        { 
          success: false, 
          error: `Tree ${treeCode} not found` 
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
  { params }: { params: Promise<{ treeCode: string }> }
) {
  try {
    const { treeCode } = await params
    const body = await request.json()
    const { variety, status, bloomingStatus, datePlanted } = body

    // First find the tree by code to get the ID
    const existingTree = await treeRepository.findByTreeCode(treeCode)
    if (!existingTree) {
      return Response.json(
        { 
          success: false, 
          error: `Tree ${treeCode} not found` 
        }, 
        { status: 404 }
      )
    }

    const tree = await treeRepository.update(existingTree.id, {
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
  { params }: { params: Promise<{ treeCode: string }> }
) {
  try {
    const { treeCode } = await params

    // First find the tree by code to get the ID
    const existingTree = await treeRepository.findByTreeCode(treeCode)
    if (!existingTree) {
      return Response.json(
        { 
          success: false, 
          error: `Tree ${treeCode} not found` 
        }, 
        { status: 404 }
      )
    }

    await treeRepository.delete(existingTree.id)

    return Response.json({
      success: true,
      message: `Tree ${treeCode} deleted successfully`
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