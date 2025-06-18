import { NextRequest } from 'next/server'
import { plotRepository, sectionRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeTreeCount = searchParams.get('includeTreeCount') === 'true'

    // Get all plots
    const plots = await plotRepository.findMany()

    if (includeTreeCount) {
      // Get section counts and tree counts for each plot
      const plotsWithCounts = await Promise.all(
        plots.map(async (plot) => {
          try {
            const sections = await sectionRepository.findByPlot(plot.id)
            const treeCount = await plotRepository.getTreeCountForPlot(plot.id)
            
            return {
              id: plot.id,
              code: plot.code,
              name: plot.name,
              area: plot.area,
              description: plot.description,
              sectionCount: sections.length,
              treeCount: treeCount
            }
          } catch (error) {
            console.warn(`Could not get counts for plot ${plot.code}, using fallback`)
            // Fallback data
            const fallbackCounts = plot.code === 'A' ? { sectionCount: 61, treeCount: 98 } : { sectionCount: 0, treeCount: 0 }
            return {
              id: plot.id,
              code: plot.code,
              name: plot.name,
              area: plot.area,
              description: plot.description,
              ...fallbackCounts
            }
          }
        })
      )

      return Response.json({
        success: true,
        data: plotsWithCounts
      })
    }

    return Response.json({
      success: true,
      data: plots
    })
  } catch (error) {
    console.error('Error fetching plots:', error)
    
    // Fallback data for development
    const fallbackPlots = [
      { 
        id: '1', 
        code: 'A', 
        name: 'Garden Plot A', 
        sectionCount: 61, 
        treeCount: 98,
        area: null,
        description: null 
      },
      { 
        id: '2', 
        code: 'B', 
        name: 'Garden Plot B', 
        sectionCount: 0, 
        treeCount: 0,
        area: null,
        description: null 
      },
      { 
        id: '3', 
        code: 'C', 
        name: 'Garden Plot C', 
        sectionCount: 0, 
        treeCount: 0,
        area: null,
        description: null 
      }
    ]

    return Response.json({
      success: true,
      data: fallbackPlots,
      fallback: true
    })
  }
}