import { NextResponse } from 'next/server'
import { getStorageStatus } from '@/lib/storage'

export async function GET() {
  try {
    const status = await getStorageStatus()
    
    return NextResponse.json({
      success: true,
      data: {
        bucketExists: status.bucketExists,
        bucketName: status.bucketName,
        endpoint: status.endpoint,
        totalBuckets: status.bucketExists ? 1 : 0,
        buckets: status.bucketExists ? [{
          name: status.bucketName,
          public: true
        }] : []
      }
    })
  } catch (error) {
    console.error('Storage status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check storage status'
      },
      { status: 500 }
    )
  }
}