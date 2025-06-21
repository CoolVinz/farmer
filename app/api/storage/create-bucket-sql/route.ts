import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'tree-media'

export async function POST() {
  try {
    console.log(`🔧 Attempting to create bucket via SQL: ${BUCKET_NAME}`)
    
    // Try creating bucket via direct SQL insertion
    const { data, error } = await supabase.rpc('create_storage_bucket', {
      bucket_name: BUCKET_NAME,
      is_public: true
    })
    
    if (error) {
      console.error('SQL bucket creation failed:', error)
      
      // Fallback: Try direct SQL query if RPC doesn't exist
      const { data: sqlData, error: sqlError } = await supabase
        .from('storage.buckets')
        .insert([
          {
            id: BUCKET_NAME,
            name: BUCKET_NAME,
            public: true,
            file_size_limit: 10485760,
            allowed_mime_types: ['image/*']
          }
        ])
      
      if (sqlError) {
        console.error('Direct SQL insertion also failed:', sqlError)
        return NextResponse.json({
          success: false,
          error: `SQL bucket creation failed: ${error.message}`,
          details: {
            rpcError: error.message,
            sqlError: sqlError.message,
            suggestion: 'Please create the bucket manually in your Supabase dashboard'
          }
        }, { status: 500 })
      }
      
      console.log(`✅ Bucket created via direct SQL: ${BUCKET_NAME}`)
      return NextResponse.json({
        success: true,
        message: `Bucket '${BUCKET_NAME}' created successfully via SQL`,
        method: 'direct_sql'
      })
    }

    console.log(`✅ Bucket created via RPC: ${BUCKET_NAME}`)
    
    return NextResponse.json({
      success: true,
      message: `Bucket '${BUCKET_NAME}' created successfully via RPC`,
      method: 'rpc'
    })

  } catch (error) {
    console.error('SQL bucket creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      suggestion: 'Please try the standard bucket creation method or create manually in dashboard'
    }, { status: 500 })
  }
}