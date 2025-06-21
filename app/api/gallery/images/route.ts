import { NextResponse } from 'next/server'
import { treeLogRepository } from '@/lib/repositories'

export async function GET() {
  try {
    const data = await treeLogRepository.findManyWithImages()
    
    // Transform data to match expected interface (using snake_case to match component expectations)
    const transformedData = data.map(item => ({
      id: item.id,
      tree_id: item.treeId || '',
      notes: item.notes || '',
      image_path: item.imagePath || '',
      log_date: item.logDate,
      activity_type: item.activityType,
      health_status: item.healthStatus,
      trees: item.tree ? {
        location_id: item.tree.location_id,
        tree_number: item.tree.treeNumber || 1,
        variety: item.tree.variety || ''
      } : null
    }))
    
    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการโหลดรูปภาพ' }, 
      { status: 500 }
    )
  }
}