import { NextRequest } from 'next/server'
import { sectionRepository } from '@/lib/repositories'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { sectionCodes } = body

    if (!sectionCodes || !Array.isArray(sectionCodes) || sectionCodes.length === 0) {
      return Response.json(
        { 
          success: false, 
          error: 'Section codes array is required' 
        }, 
        { status: 400 }
      )
    }

    // Track results for each section
    const results = []
    let successCount = 0
    let failureCount = 0

    // Process each section deletion
    for (const sectionCode of sectionCodes) {
      try {
        // Find section by code first
        const existingSection = await sectionRepository.findBySectionCode(sectionCode)
        
        if (!existingSection) {
          results.push({
            sectionCode,
            success: false,
            error: `Section ${sectionCode} not found`
          })
          failureCount++
          continue
        }

        // Delete the section
        await sectionRepository.delete(existingSection.id)
        
        results.push({
          sectionCode,
          success: true
        })
        successCount++
      } catch (error) {
        console.error(`Error deleting section ${sectionCode}:`, error)
        results.push({
          sectionCode,
          success: false,
          error: error instanceof Error ? error.message : 'Delete failed'
        })
        failureCount++
      }
    }

    // Return summary of results
    const response = {
      success: successCount > 0, // Consider success if at least one deletion succeeded
      summary: {
        total: sectionCodes.length,
        succeeded: successCount,
        failed: failureCount
      },
      results
    }

    // Return appropriate status code
    if (successCount === sectionCodes.length) {
      // All succeeded
      return Response.json(response)
    } else if (successCount > 0) {
      // Partial success
      return Response.json(response, { status: 207 }) // Multi-Status
    } else {
      // All failed
      return Response.json(response, { status: 400 })
    }
  } catch (error) {
    console.error('Bulk delete error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to process bulk delete request' 
      }, 
      { status: 500 }
    )
  }
}