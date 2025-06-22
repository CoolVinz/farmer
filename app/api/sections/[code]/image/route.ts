import { NextResponse } from 'next/server'
import { sectionRepository } from '@/lib/repositories'
import { uploadImage } from '@/lib/minio'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Upload to MinIO
    const uploadResult = await uploadImage(file, 'sections')
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Find section by code first
    const existingSection = await sectionRepository.findBySectionCode(code)
    
    if (!existingSection) {
      return NextResponse.json(
        { error: `Section ${code} not found` },
        { status: 404 }
      )
    }

    // Update section with image path
    const section = await sectionRepository.update(existingSection.id, {
      imagePath: uploadResult.url
    })

    return NextResponse.json({
      success: true,
      section,
      imageUrl: uploadResult.url
    })
  } catch (error) {
    console.error('Section image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload section image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  try {
    // Find section by code first
    const existingSection = await sectionRepository.findBySectionCode(code)
    
    if (!existingSection) {
      return NextResponse.json(
        { error: `Section ${code} not found` },
        { status: 404 }
      )
    }

    // Remove image path from section
    const section = await sectionRepository.update(existingSection.id, {
      imagePath: undefined
    })

    return NextResponse.json({
      success: true,
      section
    })
  } catch (error) {
    console.error('Section image delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove section image' },
      { status: 500 }
    )
  }
}