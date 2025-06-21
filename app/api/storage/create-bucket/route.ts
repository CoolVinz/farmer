import { NextResponse } from 'next/server'
import { initializeStorage, checkBucketExists } from '@/lib/storage'

const BUCKET_NAME = process.env.MINIO_BUCKET || 'tree-media'

export async function POST() {
  try {
    console.log(`🔧 Attempting to create MinIO bucket: ${BUCKET_NAME}`)
    
    // Check if bucket already exists
    const bucketExists = await checkBucketExists()
    
    if (bucketExists) {
      console.log(`✅ Bucket ${BUCKET_NAME} already exists`)
      return NextResponse.json({
        success: true,
        message: `MinIO bucket '${BUCKET_NAME}' already exists`,
        bucketExists: true
      })
    }

    console.log(`📦 Creating MinIO bucket: ${BUCKET_NAME}`)
    
    // Initialize storage (creates bucket if needed)
    const created = await initializeStorage()
    
    if (!created) {
      return NextResponse.json({
        success: false,
        error: `Failed to create MinIO bucket: ${BUCKET_NAME}`,
        suggestion: 'Please check MinIO server accessibility and credentials'
      }, { status: 500 })
    }

    console.log(`✅ MinIO bucket created successfully: ${BUCKET_NAME}`)
    
    return NextResponse.json({
      success: true,
      message: `MinIO bucket '${BUCKET_NAME}' created successfully`,
      bucketExists: true,
      method: 'minio'
    })

  } catch (error) {
    console.error('MinIO bucket creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'Please check MinIO server configuration and credentials'
    }, { status: 500 })
  }
}