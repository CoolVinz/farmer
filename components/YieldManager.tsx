"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface YieldManagerProps {
  treeId: string
  currentYield: number
  onYieldUpdate: (newYield: number) => void
  onViewTrends?: () => void
}

export function YieldManager({ treeId, currentYield, onYieldUpdate, onViewTrends }: YieldManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  async function updateYield(newYield: number, reason: string) {
    if (newYield < 0) {
      toast.error('จำนวนผลไม้ไม่สามารถติดลบได้')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/trees/${treeId}/yield`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newYield,
          reason,
          previousYield: currentYield
        })
      })

      const result = await response.json()
      
      if (result.success) {
        onYieldUpdate(newYield)
        toast.success(`อัปเดตจำนวนผลไม้เป็น ${newYield} ลูก`)
      } else {
        toast.error(result.error || 'ไม่สามารถอัปเดตได้')
      }
    } catch (error) {
      console.error('Error updating yield:', error)
      toast.error('เกิดข้อผิดพลาดในการอัปเดต')
    } finally {
      setIsUpdating(false)
    }
  }

  function handleQuickUpdate(change: number) {
    const newYield = currentYield + change
    const reason = change > 0 ? 'เพิ่มผลไม้' : 'ลดผลไม้'
    updateYield(newYield, reason)
  }

  function handleCustomUpdate() {
    const amount = parseInt(customAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error('กรุณากรอกจำนวนที่ถูกต้อง')
      return
    }
    
    updateYield(amount, 'ปรับแก้จำนวนผลไม้')
    setCustomAmount('')
    setShowCustomInput(false)
  }

  function getYieldStatus(yieldAmount: number) {
    if (yieldAmount === 0) return { color: 'bg-gray-100 text-gray-800', label: 'ไม่มีผล' }
    if (yieldAmount <= 5) return { color: 'bg-red-100 text-red-800', label: 'ผลน้อย' }
    if (yieldAmount <= 15) return { color: 'bg-yellow-100 text-yellow-800', label: 'ผลปานกลาง' }
    return { color: 'bg-green-100 text-green-800', label: 'ผลมาก' }
  }

  const yieldStatus = getYieldStatus(currentYield)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🥭 จำนวนผลไม้
          <Badge className={yieldStatus.color}>
            {yieldStatus.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Yield Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {currentYield}
          </div>
          <div className="text-sm text-gray-600">ลูก</div>
        </div>

        {/* Quick Update Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(-1)}
            disabled={isUpdating || currentYield === 0}
            className="text-red-600 hover:text-red-700"
          >
            -1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(-5)}
            disabled={isUpdating || currentYield < 5}
            className="text-red-600 hover:text-red-700"
          >
            -5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(5)}
            disabled={isUpdating}
            className="text-green-600 hover:text-green-700"
          >
            +5
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickUpdate(1)}
            disabled={isUpdating}
            className="text-green-600 hover:text-green-700"
          >
            +1
          </Button>
        </div>

        {/* Custom Amount Input */}
        {!showCustomInput ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            className="w-full text-blue-600 hover:text-blue-700"
          >
            ✏️ ระบุจำนวนเอง
          </Button>
        ) : (
          <div className="space-y-2">
            <Input
              type="number"
              min="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="จำนวนผลไม้ใหม่"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCustomUpdate}
                disabled={!customAmount || isUpdating}
                className="flex-1"
              >
                ✅ อัปเดต
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCustomInput(false)
                  setCustomAmount('')
                }}
                className="flex-1"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        )}

        {/* View Trends Button */}
        {onViewTrends && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewTrends}
            className="w-full text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300"
          >
            📈 ดูแนวโน้มผลผลิต
          </Button>
        )}

        {/* Status Indicators */}
        <div className="text-xs text-gray-500 text-center">
          {currentYield === 0 && "💡 เพิ่มจำนวนผลไม้เมื่อต้นไม้เริ่มให้ผล"}
          {currentYield > 0 && currentYield <= 5 && "⚠️ ผลไม้น้อย ควรดูแลเพิ่มเติม"}
          {currentYield > 5 && currentYield <= 15 && "👍 ผลไม้ปานกลาง สภาพดี"}
          {currentYield > 15 && "🌟 ผลไม้เยอะมาก สภาพดีเยี่ยม!"}
        </div>
      </CardContent>
    </Card>
  )
}