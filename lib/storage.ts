// Import MinIO functions for storage operations
import { 
  uploadImage as minioUploadImage,
  deleteImage as minioDeleteImage,
  getImageUrl as minioGetImageUrl,
  uploadMultipleImages as minioUploadMultipleImages,
  getStorageStatus as minioGetStorageStatus,
  initializeStorage as minioInitializeStorage,
  checkBucketExists as minioCheckBucketExists,
  testUpload as minioTestUpload
} from './minio'

export type UploadResult = {
  success: boolean
  url?: string
  error?: string
}

// Re-export MinIO functions with same interface for backward compatibility
export const checkBucketExists = minioCheckBucketExists
export const uploadImage = minioUploadImage
export const deleteImage = minioDeleteImage
export const getImageUrl = minioGetImageUrl
export const uploadMultipleImages = minioUploadMultipleImages
export const getStorageStatus = minioGetStorageStatus
export const initializeStorage = minioInitializeStorage

// Additional utility functions
export const testUpload = minioTestUpload

// Compress image before upload (browser-only utility)
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}