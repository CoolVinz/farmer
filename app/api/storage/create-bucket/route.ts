import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'tree-media'

export async function POST() {
  try {
    console.log(`🔧 Attempting to create bucket: ${BUCKET_NAME}`)
    
    // First, check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Failed to list buckets:', listError)
      return NextResponse.json({
        success: false,
        error: `Failed to check existing buckets: ${listError.message}`
      }, { status: 500 })
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)
    
    if (bucketExists) {
      console.log(`✅ Bucket ${BUCKET_NAME} already exists`)
      return NextResponse.json({
        success: true,
        message: `Bucket '${BUCKET_NAME}' already exists`,
        bucketExists: true
      })
    }

    console.log(`📦 Creating bucket: ${BUCKET_NAME}`)
    
    // Try Method 1: Standard bucket creation
    const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760 // 10MB
    })

    if (createError) {
      console.error('Standard bucket creation failed:', createError)
      
      // Try Method 2: Minimal bucket creation
      console.log('🔄 Trying minimal bucket creation...')
      const { data: data2, error: createError2 } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true
      })
      
      if (createError2) {
        console.error('Minimal bucket creation also failed:', createError2)
        
        return NextResponse.json({
          success: false,
          error: `Bucket creation failed: ${createError.message}`,
          details: {
            primaryError: createError.message,
            secondaryError: createError2.message,
            suggestion: 'Please create the bucket manually in your Supabase dashboard'
          }
        }, { status: 500 })
      }
      
      console.log(`✅ Bucket created with minimal settings: ${BUCKET_NAME}`)
      return NextResponse.json({
        success: true,
        message: `Bucket '${BUCKET_NAME}' created successfully (minimal settings)`,
        bucketExists: true,
        method: 'minimal'
      })
    }

    console.log(`✅ Bucket created successfully: ${BUCKET_NAME}`)
    
    return NextResponse.json({
      success: true,
      message: `Bucket '${BUCKET_NAME}' created successfully`,
      bucketExists: true,
      method: 'standard'
    })

  } catch (error) {
    console.error('Bucket creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'Please try creating the bucket manually in your Supabase dashboard'
    }, { status: 500 })
  }
}