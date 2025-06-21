import { NextResponse } from 'next/server'
import { S3Client, GetBucketPolicyCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3'

// Create S3 client for MinIO
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'tree-media'

// Public read policy for the bucket
const publicReadPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
    }
  ]
}

export async function GET() {
  try {
    // Get current bucket policy
    const command = new GetBucketPolicyCommand({ Bucket: BUCKET_NAME })
    const response = await s3Client.send(command)
    
    return NextResponse.json({
      success: true,
      bucket: BUCKET_NAME,
      policy: response.Policy ? JSON.parse(response.Policy) : null
    })
  } catch (error: any) {
    if (error.name === 'NoSuchBucketPolicy') {
      return NextResponse.json({
        success: true,
        bucket: BUCKET_NAME,
        policy: null,
        message: 'No bucket policy is currently set'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error.message,
      bucket: BUCKET_NAME
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Set public read policy
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(publicReadPolicy)
    })
    
    await s3Client.send(command)
    
    return NextResponse.json({
      success: true,
      message: `Public read policy applied to bucket '${BUCKET_NAME}'`,
      bucket: BUCKET_NAME,
      policy: publicReadPolicy
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      bucket: BUCKET_NAME
    }, { status: 500 })
  }
}