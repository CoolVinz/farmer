import { NextResponse } from 'next/server'

export async function POST() {
  // This endpoint is not applicable for MinIO
  return NextResponse.json({
    success: false,
    error: 'SQL bucket creation is not applicable for MinIO storage',
    suggestion: 'Use the standard MinIO bucket creation endpoint instead',
    redirect: '/api/storage/create-bucket'
  }, { status: 400 })
}