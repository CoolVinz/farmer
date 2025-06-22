import { NextRequest } from 'next/server'
import { treeRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined
    const take = searchParams.get('take') ? parseInt(searchParams.get('take')!) : undefined
    const sectionId = searchParams.get('sectionId') || undefined
    const plotId = searchParams.get('plotId') || undefined
    const search = searchParams.get('search') || undefined

    let trees
    if (search) {
      trees = await treeRepository.search(search)
    } else {
      trees = await treeRepository.findMany({
        skip,
        take,
        sectionId,
        plotId,
        include: {
          section: true,
          plot: true,
          logs: false
        }
      })
    }

    return Response.json({
      success: true,
      data: trees
    })
  } catch (error) {
    console.error('Error fetching trees:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch trees' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sectionId, variety, datePlanted, status, bloomingStatus } = body

    if (!sectionId || !variety) {
      return Response.json(
        { 
          success: false, 
          error: 'sectionId and variety are required' 
        }, 
        { status: 400 }
      )
    }

    const tree = await treeRepository.create({
      sectionId,
      variety,
      datePlanted,
      status,
      bloomingStatus
    })

    return Response.json({
      success: true,
      data: tree
    })
  } catch (error) {
    console.error('Error creating tree:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to create tree' 
      }, 
      { status: 500 }
    )
  }
}