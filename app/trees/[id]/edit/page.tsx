"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface Tree {
  id: string
  treeCode: string
  variety: string
  status: string
  bloomingStatus: string
  plantedDate: string | null
  fruitCount: number
  treeNumber: number
  location_id: string
  section?: {
    id: string
    sectionCode: string
    name: string
    plot?: {
      id: string
      code: string
      name: string
    }
  }
}

export default function EditTreePage() {
  const router = useRouter()
  const params = useParams()
  const [tree, setTree] = useState<Tree | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    variety: '',
    status: 'alive',
    bloomingStatus: 'not_blooming',
    datePlanted: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchTree(params.id as string)
    }
  }, [params.id])

  async function fetchTree(id: string) {
    try {
      const response = await fetch(`/api/trees/${id}`)
      const result = await response.json()
      
      if (result.success) {
        const treeData = result.data
        setTree(treeData)
        setFormData({
          variety: treeData.variety || '',
          status: treeData.status || 'alive',
          bloomingStatus: treeData.bloomingStatus || 'not_blooming',
          datePlanted: treeData.plantedDate ? treeData.plantedDate.split('T')[0] : ''
        })
      } else {
        toast.error('ไม่พบข้อมูลต้นไม้')
        router.push('/trees')
      }
    } catch (error) {
      console.error('Error fetching tree:', error)
      toast.error('ไม่สามารถโหลดข้อมูลต้นไม้ได้')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.variety) {
      toast.error('กรุณากรอกพันธุ์ต้นไม้')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch(`/api/trees/${tree!.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variety: formData.variety,
          status: formData.status,
          bloomingStatus: formData.bloomingStatus,
          datePlanted: formData.datePlanted || null
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('บันทึกข้อมูลต้นไม้เรียบร้อยแล้ว')
        router.push(`/trees/${tree!.id}`)
      } else {
        toast.error(result.error || 'ไม่สามารถบันทึกข้อมูลได้')
      }
    } catch (error) {
      console.error('Error updating tree:', error)
      toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setSaving(false)
    }
  }

  function updateFormData(field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, string> = {
      'alive': 'bg-green-100 text-green-800',
      'dead': 'bg-red-100 text-red-800',
      'sick': 'bg-yellow-100 text-yellow-800'
    }
    const labels: Record<string, string> = {
      'alive': '🌱 มีชีวิต',
      'dead': '🪦 ตายแล้ว',
      'sick': '🤒 ป่วย'
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    )
  }

  function getBloomingStatusBadge(bloomingStatus: string) {
    const variants: Record<string, string> = {
      'blooming': 'bg-pink-100 text-pink-800',
      'budding': 'bg-yellow-100 text-yellow-800',
      'not_blooming': 'bg-gray-100 text-gray-800'
    }
    const labels: Record<string, string> = {
      'blooming': '🌸 กำลังออกดอก',
      'budding': '🌿 มีดอกตูม',
      'not_blooming': '🌱 ยังไม่ออกดอก'
    }
    return (
      <Badge className={variants[bloomingStatus] || 'bg-gray-100 text-gray-800'}>
        {labels[bloomingStatus] || bloomingStatus}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg">⏳ กำลังโหลดข้อมูลต้นไม้...</div>
        </div>
      </div>
    )
  }

  if (!tree) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="text-lg text-red-600">❌ ไม่พบข้อมูลต้นไม้</div>
          <Button onClick={() => router.push('/trees')} className="mt-4">
            กลับไปหน้ารายการต้นไม้
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/trees/${tree.id}`)}
        >
          ← กลับ
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">✏️ แก้ไขข้อมูลต้นไม้</h1>
          <p className="text-gray-600 mt-1">
            {tree.treeCode} - {tree.section?.plot?.name} → {tree.section?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>แก้ไขข้อมูล</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Variety */}
              <div className="space-y-2">
                <Label>พันธุ์ <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.variety}
                  onChange={(e) => updateFormData('variety', e.target.value)}
                  placeholder="เช่น มะม่วงน้ำดอกไม้, มะม่วงโบราณ"
                  required
                />
              </div>

              {/* Planted Date */}
              <div className="space-y-2">
                <Label>วันที่ปลูก</Label>
                <Input
                  type="date"
                  value={formData.datePlanted}
                  onChange={(e) => updateFormData('datePlanted', e.target.value)}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>สถานะต้นไม้</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => updateFormData('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alive">🌱 มีชีวิต</SelectItem>
                    <SelectItem value="sick">🤒 ป่วย</SelectItem>
                    <SelectItem value="dead">🪦 ตายแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Blooming Status */}
              <div className="space-y-2">
                <Label>สถานะการออกดอก</Label>
                <Select 
                  value={formData.bloomingStatus} 
                  onValueChange={(value) => updateFormData('bloomingStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_blooming">🌱 ยังไม่ออกดอก</SelectItem>
                    <SelectItem value="budding">🌿 มีดอกตูม</SelectItem>
                    <SelectItem value="blooming">🌸 กำลังออกดอก</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/trees/${tree.id}`)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !formData.variety}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? '⏳ กำลังบันทึก...' : '✅ บันทึกข้อมูล'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Info & Preview */}
        <div className="space-y-6">
          {/* Current Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">รหัสต้นไม้</label>
                <p className="text-lg font-semibold">{tree.treeCode}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">ตำแหน่ง</label>
                <p>{tree.location_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">แปลง → แผนก</label>
                <p>
                  {tree.section?.plot?.code} - {tree.section?.plot?.name} →{' '}
                  {tree.section?.sectionCode} - {tree.section?.name}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">ลำดับต้นไม้</label>
                <p>ต้นที่ {tree.treeNumber}</p>
              </div>
              
              {tree.fruitCount > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">จำนวนผลไม้</label>
                  <p className="text-lg font-semibold text-green-600">
                    🥭 {tree.fruitCount} ลูก
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Changes */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 ตัวอย่างการเปลี่ยนแปลง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">พันธุ์:</span>
                <div className="text-right">
                  {tree.variety !== formData.variety && (
                    <div className="text-xs text-gray-500 line-through">
                      {tree.variety || 'ไม่ระบุ'}
                    </div>
                  )}
                  <div className={tree.variety !== formData.variety ? 'text-blue-600 font-medium' : ''}>
                    {formData.variety || 'ไม่ระบุ'}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">สถานะ:</span>
                <div className="text-right space-y-1">
                  {tree.status !== formData.status && (
                    <div className="text-xs">
                      {getStatusBadge(tree.status)}
                    </div>
                  )}
                  <div>
                    {getStatusBadge(formData.status)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">การออกดอก:</span>
                <div className="text-right space-y-1">
                  {tree.bloomingStatus !== formData.bloomingStatus && (
                    <div className="text-xs">
                      {getBloomingStatusBadge(tree.bloomingStatus)}
                    </div>
                  )}
                  <div>
                    {getBloomingStatusBadge(formData.bloomingStatus)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">วันที่ปลูก:</span>
                <div className="text-right">
                  {(tree.plantedDate?.split('T')[0] || '') !== formData.datePlanted && (
                    <div className="text-xs text-gray-500 line-through">
                      {tree.plantedDate ? new Date(tree.plantedDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                    </div>
                  )}
                  <div className={(tree.plantedDate?.split('T')[0] || '') !== formData.datePlanted ? 'text-blue-600 font-medium' : ''}>
                    {formData.datePlanted ? new Date(formData.datePlanted).toLocaleDateString('th-TH') : 'ไม่ระบุ'}
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              {(tree.variety !== formData.variety || 
                tree.status !== formData.status || 
                tree.bloomingStatus !== formData.bloomingStatus || 
                (tree.plantedDate?.split('T')[0] || '') !== formData.datePlanted) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 มีการเปลี่ยนแปลงข้อมูล - กดบันทึกเพื่อยืนยัน
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การจัดการอื่นๆ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push(`/logs/add-single?treeId=${tree.id}`)}
                className="w-full"
                variant="outline"
              >
                📝 เพิ่มบันทึกการดูแล
              </Button>
              
              <Button 
                onClick={() => router.push(`/trees/${tree.id}`)}
                className="w-full"
                variant="outline"
              >
                👁️ ดูข้อมูลต้นไม้
              </Button>
              
              <Button 
                onClick={() => router.push('/trees')}
                className="w-full"
                variant="outline"
              >
                📋 กลับไปรายการต้นไม้
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}