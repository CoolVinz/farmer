import { NextResponse } from 'next/server'
import { getStorageStatus } from '@/lib/storage'

export async function GET() {
  try {
    // Get MinIO storage status
    const status = await getStorageStatus()
    
    // Return bucket information in Supabase-compatible format
    const buckets = status.bucketExists ? [{
      id: status.bucketName,
      name: status.bucketName,
      public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }] : []
    
    return NextResponse.json({
      success: true,
      buckets,
      totalBuckets: buckets.length
    })
  } catch (error) {
    console.error('Bucket listing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list buckets',
        buckets: []
      },
      { status: 500 }
    )
  }
}