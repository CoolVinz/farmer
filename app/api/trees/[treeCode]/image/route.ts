import { NextResponse } from 'next/server'
import { treeRepository } from '@/lib/repositories'
import { uploadImage } from '@/lib/minio'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ treeCode: string }> }
) {
  const { treeCode } = await params
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

    // First find the tree by code to get the ID
    const existingTree = await treeRepository.findByTreeCode(treeCode)
    if (!existingTree) {
      return NextResponse.json(
        { error: `Tree ${treeCode} not found` },
        { status: 404 }
      )
    }

    // Upload to MinIO
    const uploadResult = await uploadImage(file, 'trees')
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Update tree with image path
    const tree = await treeRepository.update(existingTree.id, {
      imagePath: uploadResult.url
    })

    return NextResponse.json({
      success: true,
      tree,
      imageUrl: uploadResult.url
    })
  } catch (error) {
    console.error('Tree image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload tree image' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ treeCode: string }> }
) {
  const { treeCode } = await params
  try {
    // First find the tree by code to get the ID
    const existingTree = await treeRepository.findByTreeCode(treeCode)
    if (!existingTree) {
      return NextResponse.json(
        { error: `Tree ${treeCode} not found` },
        { status: 404 }
      )
    }

    // Remove image path from tree
    const tree = await treeRepository.update(existingTree.id, {
      imagePath: undefined
    })

    return NextResponse.json({
      success: true,
      tree
    })
  } catch (error) {
    console.error('Tree image delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove tree image' },
      { status: 500 }
    )
  }
}