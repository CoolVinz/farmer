import { NextRequest } from 'next/server'
import { sectionRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plotId = searchParams.get('plotId')
    const includeTreeCount = searchParams.get('includeTreeCount') === 'true'
    const includePlot = searchParams.get('includePlot') === 'true'

    const sections = await sectionRepository.findMany({
      plotId: plotId || undefined,
      includeTreeCount,
      includePlot
    })

    return Response.json({
      success: true,
      data: sections
    })
  } catch (error) {
    console.error('Error fetching sections:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch sections' 
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plotId, name, description, area, soilType } = body

    if (!plotId) {
      return Response.json(
        { 
          success: false, 
          error: 'Plot ID is required' 
        }, 
        { status: 400 }
      )
    }

    const section = await sectionRepository.create({
      plotId,
      name,
      description,
      area,
      soilType
    })

    return Response.json({
      success: true,
      data: section
    })
  } catch (error) {
    console.error('Error creating section:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to create section' 
      }, 
      { status: 500 }
    )
  }
}