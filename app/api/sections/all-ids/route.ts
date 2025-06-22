import { NextRequest } from 'next/server'
import { sectionRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plotId = searchParams.get('plotId')
    const plotCode = searchParams.get('plotCode')

    // Get all section IDs with minimal data
    const sections: any[] = await sectionRepository.findMany({
      plotId: plotId || undefined,
      includeTreeCount: true, // Include tree count for filtering
      includePlot: true // Include plot info for filtering
    })

    // Filter by plot code if specified
    let filteredSections: any[] = sections
    if (plotCode && plotCode !== 'all') {
      filteredSections = sections.filter((section: any) => 
        section.plot?.code === plotCode.toUpperCase()
      )
    }

    // Return lightweight data for selection
    const sectionIds = filteredSections.map((section: any) => ({
      id: section.id,
      sectionCode: section.sectionCode,
      treeCount: section.treeCount || 0,
      plotCode: section.plot?.code || 'Unknown'
    }))

    return Response.json({
      success: true,
      data: {
        sections: sectionIds,
        total: sectionIds.length,
        totalTrees: sectionIds.reduce((sum, section) => sum + section.treeCount, 0),
        plotBreakdown: getPlotBreakdown(sectionIds)
      }
    })
  } catch (error) {
    console.error('Error fetching all section IDs:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch section IDs' 
      }, 
      { status: 500 }
    )
  }
}

// Helper function to get breakdown by plot
function getPlotBreakdown(sections: any[]) {
  const breakdown: Record<string, { count: number, trees: number }> = {}
  
  sections.forEach(section => {
    const plotCode = section.plotCode
    if (!breakdown[plotCode]) {
      breakdown[plotCode] = { count: 0, trees: 0 }
    }
    breakdown[plotCode].count += 1
    breakdown[plotCode].trees += section.treeCount
  })
  
  return breakdown
}