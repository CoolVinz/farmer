import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'tree-media'

export async function POST() {
  try {
    // Create a small test file to verify upload functionality
    const testContent = new Blob(['test-upload-' + Date.now()], { type: 'text/plain' })
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' })
    
    // Generate unique filename
    const fileName = `test/upload-test-${Date.now()}.txt`
    
    console.log(`🧪 Testing upload to bucket: ${BUCKET_NAME}`)
    
    // Attempt upload
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) {
      console.error('Test upload failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        bucketExists: false,
        testPerformed: 'upload_test'
      })
    }
    
    console.log('✅ Test upload successful:', data)
    
    // Get public URL to verify
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName])
    
    return NextResponse.json({
      success: true,
      bucketExists: true,
      testPerformed: 'upload_test',
      testFileUrl: urlData.publicUrl,
      cleanedUp: !deleteError,
      message: 'Bucket is functional for uploads!'
    })
    
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      bucketExists: false,
      testPerformed: 'upload_test'
    }, { status: 500 })
  }
}