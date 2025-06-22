import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

// MinIO Configuration with validation
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
const BUCKET_NAME = process.env.MINIO_BUCKET || 'tree-media'

// Validate environment variables
if (!MINIO_ENDPOINT) {
  console.error('❌ MINIO_ENDPOINT environment variable is not set')
}
if (!MINIO_ACCESS_KEY) {
  console.error('❌ MINIO_ACCESS_KEY environment variable is not set')
}
if (!MINIO_SECRET_KEY) {
  console.error('❌ MINIO_SECRET_KEY environment variable is not set')
}

// Create S3 client for MinIO with better error handling
function createS3Client(): S3Client | null {
  if (!MINIO_ENDPOINT || !MINIO_ACCESS_KEY || !MINIO_SECRET_KEY) {
    console.error('❌ MinIO configuration incomplete - missing environment variables:', {
      endpoint: MINIO_ENDPOINT || 'not-configured' ? '✅ Set' : '❌ Missing',
      accessKey: MINIO_ACCESS_KEY ? '✅ Set' : '❌ Missing',
      secretKey: MINIO_SECRET_KEY ? '✅ Set' : '❌ Missing',
    })
    return null
  }

  try {
    const client = new S3Client({
      endpoint: MINIO_ENDPOINT || 'not-configured',
      region: 'us-east-1', // MinIO requires a region, but it's not used
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO
      requestHandler: {
        requestTimeout: 10000, // 10 second timeout
        connectionTimeout: 5000 // 5 second connection timeout
      }
    })
    console.log('✅ MinIO S3 client initialized successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to initialize MinIO S3 client:', error)
    return null
  }
}

let s3Client: S3Client | null = createS3Client()

// Check if bucket exists
export async function checkBucketExists(): Promise<boolean> {
  if (!s3Client) {
    console.error('❌ MinIO S3 client not initialized - cannot check bucket')
    return false
  }
  
  if (!BUCKET_NAME) {
    console.error('❌ Bucket name not configured')
    return false
  }

  try {
    console.log(`🔍 Checking if bucket '${BUCKET_NAME}' exists...`)
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    console.log(`✅ Bucket '${BUCKET_NAME}' exists and is accessible`)
    return true
  } catch (error: any) {
    console.error(`❌ Bucket check failed for '${BUCKET_NAME}':`, {
      message: error.message,
      name: error.name,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint: MINIO_ENDPOINT || 'not-configured',
      requestId: error.$metadata?.requestId,
      cfId: error.$metadata?.cfId,
      // Additional debugging info
      stack: error.stack?.split('\n')[0] // First line of stack trace
    })
    return false
  }
}

// Create bucket if it doesn't exist
export async function createBucket(): Promise<boolean> {
  if (!s3Client) {
    console.error('❌ MinIO S3 client not initialized - cannot create bucket')
    return false
  }

  try {
    console.log(`📦 Creating bucket: ${BUCKET_NAME}`)
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
    console.log(`✅ Created bucket: ${BUCKET_NAME}`)
    return true
  } catch (error: any) {
    console.error(`❌ Bucket creation failed for '${BUCKET_NAME}':`, {
      message: error.message,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint: MINIO_ENDPOINT || 'not-configured'
    })
    return false
  }
}

// Upload image to MinIO
export async function uploadImage(file: File, folder: string = 'logs'): Promise<UploadResult> {
  if (!s3Client) {
    // Try to reinitialize the client
    s3Client = createS3Client()
    if (!s3Client) {
      return {
        success: false,
        error: 'MinIO not configured properly. Please check environment variables: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY'
      }
    }
  }

  try {
    console.log(`📤 Starting upload for file: ${file.name} (${file.size} bytes)`)
    
    // Ensure bucket exists
    const bucketExists = await checkBucketExists()
    if (!bucketExists) {
      console.log(`📦 Bucket '${BUCKET_NAME}' doesn't exist, attempting to create...`)
      const created = await createBucket()
      if (!created) {
        return { 
          success: false, 
          error: `Unable to access or create bucket '${BUCKET_NAME}'. Please check MinIO server and credentials.` 
        }
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Convert File to ArrayBuffer for S3
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload file
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    })

    console.log(`📤 Uploading to MinIO: ${fileName}`)
    await s3Client!.send(command)
    console.log(`✅ Upload successful: ${fileName}`)

    // Construct public URL
    const publicUrl = `${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileName}`

    return {
      success: true,
      url: publicUrl
    }
  } catch (error: any) {
    console.error('❌ Upload failed:', {
      message: error.message,
      name: error.name,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
      endpoint: MINIO_ENDPOINT || 'not-configured',
      bucketName: BUCKET_NAME,
      fileSize: file.size,
      // Additional debugging info
      stack: error.stack?.split('\n')[0] // First line of stack trace
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

// Delete image from MinIO
export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    // Extract filename from URL
    let fileName = imagePath
    if (imagePath.includes('/')) {
      fileName = imagePath.split('/').slice(-2).join('/') // Get folder/filename
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    })

    await s3Client!.send(command)
    return true
  } catch (error) {
    console.error('Delete failed:', error)
    return false
  }
}

// Get image URL from MinIO
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // Construct public URL
  return `${MINIO_ENDPOINT}/${BUCKET_NAME}/${imagePath}`
}

// Upload multiple images
export async function uploadMultipleImages(files: File[], folder: string = 'logs'): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadImage(file, folder))
  return Promise.all(uploadPromises)
}

// Get storage status for diagnostics
export async function getStorageStatus(): Promise<{
  bucketExists: boolean
  bucketName: string
  endpoint: string
  error?: string
}> {
  try {
    const bucketExists = await checkBucketExists()
    
    return {
      bucketExists,
      bucketName: BUCKET_NAME,
      endpoint: MINIO_ENDPOINT || 'not-configured'
    }
  } catch (error) {
    return {
      bucketExists: false,
      bucketName: BUCKET_NAME,
      endpoint: MINIO_ENDPOINT || 'not-configured',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Initialize storage (ensure bucket exists)
export async function initializeStorage(): Promise<boolean> {
  try {
    const bucketExists = await checkBucketExists()
    
    if (!bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' not found. Creating...`)
      const created = await createBucket()
      if (!created) {
        console.error(`Failed to create bucket '${BUCKET_NAME}'`)
        return false
      }
    } else {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists`)
    }

    return true
  } catch (error) {
    console.error('Storage initialization failed:', error)
    return false
  }
}

// Test upload for diagnostics
export async function testUpload(): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    // Create a test file
    const testContent = `Test upload at ${new Date().toISOString()}`
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' })
    
    const result = await uploadImage(testFile, 'test')
    
    if (result.success && result.url) {
      // Clean up test file
      await deleteImage(`test/${testFile.name}`)
    }
    
    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test upload failed'
    }
  }
}