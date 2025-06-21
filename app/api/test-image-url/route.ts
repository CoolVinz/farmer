import { NextResponse } from 'next/server'
import { getImageUrl } from '@/lib/utils/imageUtils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imagePath = searchParams.get('path') || 'logs/test-image.jpg'
  
  const url = getImageUrl(imagePath)
  
  return NextResponse.json({
    imagePath,
    generatedUrl: url,
    environment: {
      NEXT_PUBLIC_MINIO_ENDPOINT: process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
      NEXT_PUBLIC_MINIO_BUCKET: process.env.NEXT_PUBLIC_MINIO_BUCKET,
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ? 'SET' : 'NOT_SET',
      MINIO_BUCKET: process.env.MINIO_BUCKET
    }
  })
}