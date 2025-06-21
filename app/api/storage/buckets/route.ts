import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        buckets: []
      })
    }
    
    return NextResponse.json({
      success: true,
      buckets: buckets || [],
      totalBuckets: buckets?.length || 0
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