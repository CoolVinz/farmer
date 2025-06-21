import { NextResponse } from 'next/server'
import { testUpload } from '@/lib/storage'

export async function POST() {
  try {
    console.log('🧪 Testing MinIO upload...')
    
    const result = await testUpload()
    
    if (result.success) {
      console.log('✅ Test upload successful:', result)
      return NextResponse.json({
        success: true,
        bucketExists: true,
        testPerformed: 'minio_upload_test',
        testFileUrl: result.url,
        cleanedUp: true,
        message: 'MinIO bucket is functional for uploads!'
      })
    } else {
      console.error('❌ Test upload failed:', result.error)
      return NextResponse.json({
        success: false,
        bucketExists: false,
        testPerformed: 'minio_upload_test',
        error: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      success: false,
      bucketExists: false,
      testPerformed: 'minio_upload_test',
      error: error instanceof Error ? error.message : 'Test upload failed'
    }, { status: 500 })
  }
}