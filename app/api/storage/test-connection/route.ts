import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check environment variables
    const endpoint = process.env.MINIO_ENDPOINT
    const accessKey = process.env.MINIO_ACCESS_KEY
    const secretKey = process.env.MINIO_SECRET_KEY
    const bucket = process.env.MINIO_BUCKET

    const envStatus = {
      MINIO_ENDPOINT: endpoint ? '✅ Set' : '❌ Missing',
      MINIO_ACCESS_KEY: accessKey ? '✅ Set' : '❌ Missing', 
      MINIO_SECRET_KEY: secretKey ? '✅ Set' : '❌ Missing',
      MINIO_BUCKET: bucket ? '✅ Set' : '❌ Missing'
    }

    // Test basic connectivity
    let connectivityTest = '❌ Failed'
    try {
      if (endpoint) {
        const testUrl = new URL(endpoint)
        const response = await fetch(testUrl.origin, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        })
        connectivityTest = response.ok ? '✅ Reachable' : `❌ HTTP ${response.status}`
      }
    } catch (error: any) {
      connectivityTest = `❌ ${error.message}`
    }

    // Test MinIO credentials
    let credentialTest = '❌ Failed'
    try {
      const { checkBucketExists } = await import('@/lib/minio')
      const bucketExists = await checkBucketExists()
      credentialTest = bucketExists ? '✅ Valid & Bucket Exists' : '⚠️ Valid but Bucket Missing'
    } catch (error: any) {
      credentialTest = `❌ ${error.message}`
    }

    return NextResponse.json({
      status: 'MinIO Connection Test',
      timestamp: new Date().toISOString(),
      environment: envStatus,
      connectivity: connectivityTest,
      credentials: credentialTest,
      endpoint: endpoint || 'Not configured',
      bucket: bucket || 'tree-media (default)'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}