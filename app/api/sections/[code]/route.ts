import { NextRequest } from 'next/server'
import { sectionRepository, treeRepository } from '@/lib/repositories'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const { searchParams } = new URL(request.url)
    const includeTrees = searchParams.get('includeTrees') === 'true'
    const includePlot = searchParams.get('includePlot') === 'true'

    const section = await sectionRepository.findBySectionCode(code, {
      includeTrees,
      includePlot,
      includeTreeCount: true
    })

    if (!section) {
      return Response.json(
        { 
          success: false, 
          error: `Section ${code} not found` 
        }, 
        { status: 404 }
      )
    }

    // Get trees separately for better control
    let trees: any[] = []
    if (includeTrees) {
      try {
        trees = await treeRepository.findBySectionCode(code)
      } catch (error) {
        console.warn('Could not fetch trees, using empty array')
        trees = []
      }
    }

    return Response.json({
      success: true,
      data: {
        section,
        trees
      }
    })
  } catch (error) {
    console.error('Error fetching section:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch section details' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { name, description, area, soilType } = body

    // First find the section to get its ID
    const existingSection = await sectionRepository.findBySectionCode(code)
    
    if (!existingSection) {
      return Response.json(
        { 
          success: false, 
          error: `Section ${code} not found` 
        }, 
        { status: 404 }
      )
    }

    const updateData = {
      name: name?.trim() || undefined,
      description: description?.trim() || undefined,
      area: area ? parseFloat(area) : undefined,
      soilType: soilType?.trim() || undefined
    }

    const updatedSection = await sectionRepository.update(existingSection.id, updateData)

    return Response.json({
      success: true,
      data: updatedSection
    })
  } catch (error) {
    console.error('Error updating section:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to update section' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    // First find the section to get its ID
    const existingSection = await sectionRepository.findBySectionCode(code)
    
    if (!existingSection) {
      return Response.json(
        { 
          success: false, 
          error: `Section ${code} not found` 
        }, 
        { status: 404 }
      )
    }

    await sectionRepository.delete(existingSection.id)

    return Response.json({
      success: true,
      message: `Section ${code} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting section:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to delete section' 
      }, 
      { status: 500 }
    )
  }
}