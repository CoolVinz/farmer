import { NextResponse } from 'next/server'
import { testUpload, getStorageStatus } from '@/lib/minio'

export async function POST() {
  try {
    console.log('🧪 Testing MinIO connection...')
    
    // Test storage status
    const status = await getStorageStatus()
    console.log('📊 Storage status:', status)
    
    // Test upload
    const uploadResult = await testUpload()
    console.log('📤 Upload test result:', uploadResult)
    
    return NextResponse.json({
      success: true,
      data: {
        status,
        uploadTest: uploadResult
      }
    })
  } catch (error) {
    console.error('❌ MinIO test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'MinIO test failed'
      },
      { status: 500 }
    )
  }
}