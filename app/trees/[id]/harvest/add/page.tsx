"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface Tree {
  id: string
  treeCode: string
  variety: string
  status: string
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  const [formData, setFormData] = useState({
    harvestDate: new Date().toISOString().split('T')[0],
    quantity: '',
    weight: '',
    qualityGrade: 'A',
    notes: ''
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
    
    if (!formData.harvestDate) {
      toast.error('กรุณาเลือกวันที่เก็บเกี่ยว')
      return
    }

    if (!formData.quantity && !formData.weight) {
      toast.error('กรุณากรอกจำนวนหรือน้ำหนัก')
      return
    }

    setSaving(true)
    
    try {
      // Create harvest log entry in tree_logs
      const logData = {
        treeId: tree!.id,
        logDate: formData.harvestDate,
        activityType: 'harvest',
        notes: `เก็บเกี่ยว: ${formData.quantity ? `${formData.quantity} ลูก` : ''} ${formData.weight ? `${formData.weight} กก.` : ''} คุณภาพ: ${formData.qualityGrade}${formData.notes ? ` - ${formData.notes}` : ''}`,
        healthStatus: null,
        fertilizerType: null
      }
      
      const response = await fetch('/api/trees/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update tree's fruit count if quantity is provided
        if (formData.quantity) {
          await fetch(`/api/trees/${tree!.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fruitCount: parseInt(formData.quantity) || 0
            })
          })
        }
        
        toast.success('บันทึกการเก็บเกี่ยวเรียบร้อยแล้ว')
        router.push(`/trees/${tree!.id}`)
      } else {
        toast.error(result.error || 'ไม่สามารถบันทึกข้อมูลได้')
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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">📊 บันทึกการเก็บเกี่ยว</h1>
          <p className="text-gray-600 mt-1">
            {tree.treeCode} - {tree.section?.plot?.name} → {tree.section?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Harvest Form */}
        <Card>
          <CardHeader>
            <CardTitle>บันทึกข้อมูลการเก็บเกี่ยว</CardTitle>
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
                <Label>จำนวนผลไม้ (ลูก)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => updateFormData('quantity', e.target.value)}
                  placeholder="เช่น 25"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label>น้ำหนัก (กิโลกรัม)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  placeholder="เช่น 15.5"
                />
              </div>

              {/* Quality Grade */}
              <div className="space-y-2">
                <Label>เกรดคุณภาพ</Label>
                <Select 
                  value={formData.qualityGrade} 
                  onValueChange={(value) => updateFormData('qualityGrade', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">🥇 เกรด A (ดีเยี่ยม)</SelectItem>
                    <SelectItem value="B">🥈 เกรด B (ดี)</SelectItem>
                    <SelectItem value="C">🥉 เกรด C (ปานกลาง)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>หมายเหตุ</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม เช่น สภาพผลไม้, การขนส่ง..."
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>รูปภาพการเก็บเกี่ยว</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="ตัวอย่างรูปภาพ"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
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
                  disabled={saving || (!formData.quantity && !formData.weight)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? '⏳ กำลังบันทึก...' : '📊 บันทึกการเก็บเกี่ยว'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tree Info & Summary */}
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
                <label className="text-sm font-medium text-gray-600">ที่ตั้ง</label>
                <p>
                  {tree.section?.plot?.code} - {tree.section?.plot?.name} →{' '}
                  {tree.section?.sectionCode} - {tree.section?.name}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">สถานะ</label>
                <Badge className={tree.status === 'alive' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {tree.status === 'alive' ? '🌱 มีชีวิต' : tree.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Harvest Summary */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 สรุปการเก็บเกี่ยวครั้งนี้</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">วันที่:</span>
                <span>{formData.harvestDate ? new Date(formData.harvestDate).toLocaleDateString('th-TH') : '-'}</span>
              </div>

              {formData.quantity && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">จำนวน:</span>
                  <span className="font-semibold text-green-600">🥭 {formData.quantity} ลูก</span>
                </div>
              )}

              {formData.weight && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">น้ำหนัก:</span>
                  <span className="font-semibold text-blue-600">⚖️ {formData.weight} กก.</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">เกรด:</span>
                <Badge className={
                  formData.qualityGrade === 'A' ? 'bg-yellow-100 text-yellow-800' :
                  formData.qualityGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }>
                  {formData.qualityGrade === 'A' ? '🥇' : 
                   formData.qualityGrade === 'B' ? '🥈' : '🥉'} เกรด {formData.qualityGrade}
                </Badge>
              </div>

              {formData.notes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">หมายเหตุ:</span>
                  <p className="text-sm text-gray-700 mt-1">{formData.notes}</p>
                </div>
              )}

              {(!formData.quantity && !formData.weight) && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 กรุณากรอกจำนวนหรือน้ำหนักเพื่อบันทึกการเก็บเกี่ยว
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>💡 คำแนะนำ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• บันทึกทันทีหลังเก็บเกี่ยวเพื่อความแม่นยำ</p>
              <p>• ถ่ายรูปผลไม้เป็นหลักฐาน</p>
              <p>• ระบุเกรดคุณภาพสำหรับการวิเคราะห์</p>
              <p>• เก็บข้อมูลไว้เพื่อวางแผนการผลิต</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}