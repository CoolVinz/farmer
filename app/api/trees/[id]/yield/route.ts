import { NextRequest } from 'next/server'
import { treeRepository, treeLogRepository } from '@/lib/repositories'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newYield, reason, previousYield } = body

    if (newYield < 0) {
      return Response.json(
        { 
          success: false, 
          error: 'Yield cannot be negative' 
        }, 
        { status: 400 }
      )
    }

    // Update tree's fruit count
    const updatedTree = await treeRepository.update(id, {
      fruitCount: newYield
    })

    if (!updatedTree) {
      return Response.json(
        { 
          success: false, 
          error: 'Tree not found' 
        }, 
        { status: 404 }
      )
    }

    // Log the yield change
    await treeLogRepository.create({
      treeId: id,
      logDate: new Date(),
      activityType: 'yield_update',
      notes: `${reason}: จาก ${previousYield || 0} ลูก เป็น ${newYield} ลูก (${newYield - (previousYield || 0) > 0 ? '+' : ''}${newYield - (previousYield || 0)})`
    })

    return Response.json({
      success: true,
      data: updatedTree
    })
  } catch (error) {
    console.error('Error updating yield:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to update yield' 
      }, 
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const period = searchParams.get('period') || '30days'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeAnalytics = searchParams.get('analytics') === 'true'

    // Import yield calculation utilities
    const { 
      parseYieldEvents, 
      calculateYieldAnalytics, 
      generateYieldTrendData, 
      getTimePeriods 
    } = await import('@/lib/utils/yieldCalculations')

    // Get all tree logs
    const allLogs = await treeLogRepository.findMany({
      treeId: id,
      includeTree: false
    })

    // Parse yield events from logs
    const yieldEvents = parseYieldEvents(allLogs)

    // Determine date range
    let filterStartDate: Date
    let filterEndDate: Date

    if (startDate && endDate) {
      filterStartDate = new Date(startDate)
      filterEndDate = new Date(endDate)
    } else {
      const periods = getTimePeriods()
      const selectedPeriod = periods[period as keyof typeof periods] || periods['30days']
      filterStartDate = selectedPeriod.startDate
      filterEndDate = selectedPeriod.endDate
    }

    // Filter events within date range
    const filteredEvents = yieldEvents.filter(event => 
      event.date >= filterStartDate && event.date <= filterEndDate
    )

    // Generate trend data
    const trendData = generateYieldTrendData(yieldEvents, filterStartDate, filterEndDate)

    // Base response
    const response: any = {
      success: true,
      data: {
        events: filteredEvents.map(event => ({
          id: event.id,
          date: event.date,
          activityType: event.activityType,
          previousYield: event.previousYield,
          newYield: event.newYield,
          change: event.change,
          reason: event.reason,
          notes: event.notes
        })),
        trendData,
        period: {
          startDate: filterStartDate,
          endDate: filterEndDate,
          period
        }
      }
    }

    // Include analytics if requested
    if (includeAnalytics) {
      const analytics = calculateYieldAnalytics(yieldEvents, filterStartDate, filterEndDate)
      response.data.analytics = analytics
    }

    return Response.json(response)
  } catch (error) {
    console.error('Error fetching yield history:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch yield history' 
      }, 
      { status: 500 }
    )
  }
}