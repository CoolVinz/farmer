import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

// MinIO Configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT!
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY!
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY!
const BUCKET_NAME = process.env.MINIO_BUCKET || 'tree-media'

// Create S3 client for MinIO
const s3Client = new S3Client({
  endpoint: MINIO_ENDPOINT,
  region: 'us-east-1', // MinIO requires a region, but it's not used
  credentials: {
    accessKeyId: MINIO_ACCESS_KEY,
    secretAccessKey: MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
})

// Check if bucket exists
export async function checkBucketExists(): Promise<boolean> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
    return true
  } catch (error) {
    console.error('Bucket check failed:', error)
    return false
  }
}

// Create bucket if it doesn't exist
export async function createBucket(): Promise<boolean> {
  try {
    await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
    console.log(`✅ Created bucket: ${BUCKET_NAME}`)
    return true
  } catch (error) {
    console.error('Bucket creation failed:', error)
    return false
  }
}

// Upload image to MinIO
export async function uploadImage(file: File, folder: string = 'logs'): Promise<UploadResult> {
  try {
    // Ensure bucket exists
    const bucketExists = await checkBucketExists()
    if (!bucketExists) {
      const created = await createBucket()
      if (!created) {
        return { 
          success: false, 
          error: `Failed to create bucket '${BUCKET_NAME}'` 
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

    await s3Client.send(command)

    // Construct public URL
    const publicUrl = `${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileName}`

    return {
      success: true,
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload failed:', error)
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

    await s3Client.send(command)
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
      endpoint: MINIO_ENDPOINT
    }
  } catch (error) {
    return {
      bucketExists: false,
      bucketName: BUCKET_NAME,
      endpoint: MINIO_ENDPOINT,
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