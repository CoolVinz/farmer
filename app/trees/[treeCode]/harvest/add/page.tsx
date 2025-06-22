"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'

interface Tree {
  id: string
  treeCode: string
  variety: string
  status: string
  fruitCount: number
  treeNumber: number
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

export default function AddHarvestPage() {
  const router = useRouter()
  const params = useParams()
  const [tree, setTree] = useState<Tree | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    harvestDate: new Date().toISOString().split('T')[0],
    quantity: '',
    notes: ''
  })

  useEffect(() => {
    if (params.treeCode) {
      fetchTree(params.treeCode as string)
    }
  }, [params.treeCode])

  async function fetchTree(treeCode: string) {
    try {
      const response = await fetch(`/api/trees/${treeCode}`)
      const result = await response.json()
      
      if (result.success) {
        setTree(result.data)
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
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('กรุณากรอกจำนวนผลไม้ที่เก็บเกี่ยว')
      return
    }

    setSaving(true)
    
    try {
      // Create harvest log entry
      const response = await fetch('/api/logs/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          treeId: tree!.id,
          logDate: formData.harvestDate,
          activityType: 'harvest',
          notes: `เก็บเกี่ยว ${formData.quantity} ลูก${formData.notes ? ` - ${formData.notes}` : ''}`
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('บันทึกการเก็บเกี่ยวเรียบร้อยแล้ว')
        router.push(`/trees/${tree!.treeCode}?tab=harvest`)
      } else {
        toast.error(result.error || 'ไม่สามารถบันทึกการเก็บเกี่ยวได้')
      }
    } catch (error) {
      console.error('Error saving harvest:', error)
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
    <div className="container mx-auto p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.push(`/trees/${tree.treeCode}`)}
        >
          ← กลับ
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🥭 บันทึกการเก็บเกี่ยว</h1>
          <p className="text-gray-600 mt-1">
            {tree.treeCode} - {tree.section?.plot?.name} → {tree.section?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Harvest Form */}
        <Card>
          <CardHeader>
            <CardTitle>📊 ข้อมูลการเก็บเกี่ยว</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Harvest Date */}
              <div className="space-y-2">
                <Label>วันที่เก็บเกี่ยว <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => updateFormData('harvestDate', e.target.value)}
                  required
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>จำนวนผลไม้ (ลูก) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => updateFormData('quantity', e.target.value)}
                  placeholder="กรอกจำนวนผลไม้ที่เก็บเกี่ยว"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>หมายเหตุ</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม เช่น คุณภาพผลไม้, สภาพอากาศ, วิธีการเก็บ..."
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/trees/${tree.treeCode}`)}
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !formData.quantity || parseFloat(formData.quantity) <= 0}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  {saving ? '⏳ กำลังบันทึก...' : '✅ บันทึกการเก็บเกี่ยว'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tree Info & Preview */}
        <div className="space-y-6">
          {/* Tree Info */}
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลต้นไม้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">รหัสต้นไม้</label>
                <p className="text-lg font-semibold">{tree.treeCode}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">พันธุ์</label>
                <p>{tree.variety || 'ไม่ระบุ'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">ตำแหน่ง</label>
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
                  <label className="text-sm font-medium text-gray-600">จำนวนผลไม้ปัจจุบัน</label>
                  <p className="text-lg font-semibold text-green-600">
                    🥭 {tree.fruitCount} ลูก
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Harvest Preview */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 ตัวอย่างการบันทึก</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">วันที่:</span>
                <span>{formData.harvestDate ? new Date(formData.harvestDate).toLocaleDateString('th-TH') : 'ไม่ระบุ'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">จำนวน:</span>
                <span className="font-semibold text-orange-600">
                  {formData.quantity ? `🥭 ${formData.quantity} ลูก` : 'ยังไม่ระบุ'}
                </span>
              </div>

              {formData.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">หมายเหตุ:</span>
                  <p className="text-sm text-gray-700 mt-1">{formData.notes}</p>
                </div>
              )}

              {formData.quantity && parseFloat(formData.quantity) > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ✅ พร้อมบันทึกการเก็บเกี่ยว {formData.quantity} ลูก
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
                onClick={() => router.push(`/logs/add-single?treeCode=${tree.treeCode}`)}
                className="w-full"
                variant="outline"
              >
                📝 เพิ่มบันทึกการดูแลอื่นๆ
              </Button>
              
              <Button 
                onClick={() => router.push(`/trees/${tree.treeCode}`)}
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