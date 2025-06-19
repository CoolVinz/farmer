import { NextRequest } from 'next/server'
import { referenceDataRepository } from '@/lib/repositories'

export async function GET(request: NextRequest) {
  try {
    const varieties = await referenceDataRepository.findMany('variety')

    return Response.json({
      success: true,
      data: varieties
    })
  } catch (error) {
    console.error('Error fetching varieties:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch varieties' 
      }, 
      { status: 500 }
    )
  }
}