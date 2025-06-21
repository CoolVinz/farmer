import { NextResponse } from 'next/server'
import { initializeStorage } from '@/lib/storage'

export async function POST() {
  try {
    const success = await initializeStorage()
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Storage bucket initialized successfully'
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to initialize storage bucket'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Storage initialization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}