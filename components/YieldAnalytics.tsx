"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { YieldAnalytics as YieldAnalyticsType } from '@/lib/utils/yieldCalculations'

interface YieldAnalyticsProps {
  analytics: YieldAnalyticsType | null
  loading?: boolean
}

export function YieldAnalytics({ analytics, loading = false }: YieldAnalyticsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 สถิติผลผลิต</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">กำลังคำนวณ...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📊 สถิติผลผลิต</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <div className="text-3xl mb-2">📈</div>
            <p>ไม่มีข้อมูลสำหรับการวิเคราะห์</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('th-TH').format(num)
  }

  function formatDecimal(num: number, decimals: number = 1): string {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  function getNetChangeColor(change: number): string {
    if (change > 0) return 'text-green-600 bg-green-50'
    if (change < 0) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  function getVelocityLabel(velocity: number): { label: string; color: string } {
    if (velocity > 1) return { label: 'เติบโตเร็ว', color: 'bg-green-100 text-green-800' }
    if (velocity > 0.5) return { label: 'เติบโตปานกลาง', color: 'bg-blue-100 text-blue-800' }
    if (velocity > 0) return { label: 'เติบโตช้า', color: 'bg-yellow-100 text-yellow-800' }
    if (velocity < -1) return { label: 'ลดลงเร็ว', color: 'bg-red-100 text-red-800' }
    if (velocity < 0) return { label: 'ลดลงช้า', color: 'bg-orange-100 text-orange-800' }
    return { label: 'คงที่', color: 'bg-gray-100 text-gray-800' }
  }

  const velocityInfo = getVelocityLabel(analytics.yieldVelocity)

  return (
    <div className="space-y-6">
      {/* Main Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📊 สถิติผลผลิต
            <Badge variant="outline" className="text-xs">
              {analytics.period.days} วัน
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Net Change */}
            <div className={`rounded-lg p-4 ${getNetChangeColor(analytics.netChange)}`}>
              <div className="text-2xl font-bold">
                {analytics.netChange > 0 ? '+' : ''}{formatNumber(analytics.netChange)}
              </div>
              <div className="text-sm font-medium">การเปลี่ยนแปลงสุทธิ</div>
              <div className="text-xs opacity-75">ลูก</div>
            </div>

            {/* Total Increase */}
            <div className="bg-green-50 text-green-600 rounded-lg p-4">
              <div className="text-2xl font-bold">+{formatNumber(analytics.totalIncrease)}</div>
              <div className="text-sm font-medium">เพิ่มขึ้นทั้งหมด</div>
              <div className="text-xs opacity-75">{analytics.increaseEvents} ครั้ง</div>
            </div>

            {/* Total Decrease */}
            <div className="bg-red-50 text-red-600 rounded-lg p-4">
              <div className="text-2xl font-bold">-{formatNumber(analytics.totalDecrease)}</div>
              <div className="text-sm font-medium">ลดลงทั้งหมด</div>
              <div className="text-xs opacity-75">{analytics.decreaseEvents} ครั้ง</div>
            </div>

            {/* Yield Velocity */}
            <div className="bg-blue-50 text-blue-600 rounded-lg p-4">
              <div className="text-2xl font-bold">{formatDecimal(analytics.yieldVelocity)}</div>
              <div className="text-sm font-medium">อัตราการเปลี่ยนแปลง</div>
              <div className="text-xs opacity-75">ลูก/วัน</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📏 ช่วงผลผลิต</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">สูงสุด:</span>
              <span className="font-semibold text-green-600">
                🔝 {formatNumber(analytics.peakYield)} ลูก
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ต่ำสุด:</span>
              <span className="font-semibold text-orange-600">
                📉 {formatNumber(analytics.lowestYield)} ลูก
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ความแตกต่าง:</span>
              <span className="font-semibold text-blue-600">
                📊 {formatNumber(analytics.peakYield - analytics.lowestYield)} ลูก
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>ต่ำสุด</span>
                <span>สูงสุด</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">⚡ ประสิทธิภาพ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เฉลี่ยต่อเหตุการณ์:</span>
              <span className="font-semibold">
                {formatDecimal(analytics.averageChange)} ลูก
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ความเร็วการเปลี่ยนแปลง:</span>
              <Badge className={velocityInfo.color}>
                {velocityInfo.label}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ความถี่เหตุการณ์:</span>
              <span className="font-semibold">
                {formatDecimal((analytics.increaseEvents + analytics.decreaseEvents) / analytics.period.days)} ครั้ง/วัน
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">อัตราเพิ่ม:ลด:</span>
              <span className="font-semibold">
                {analytics.increaseEvents}:{analytics.decreaseEvents}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 ข้อมูลเชิงลึก</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {analytics.netChange > 0 && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span>
                  ผลผลิตเพิ่มขึ้น <strong>{formatNumber(analytics.netChange)} ลูก</strong> ในช่วง {analytics.period.days} วันที่ผ่านมา 
                  ({formatDecimal((analytics.netChange / analytics.period.days) * 30)} ลูก/เดือน)
                </span>
              </div>
            )}

            {analytics.netChange < 0 && (
              <div className="flex items-start gap-2">
                <span className="text-red-600">⚠️</span>
                <span>
                  ผลผลิตลดลง <strong>{formatNumber(Math.abs(analytics.netChange))} ลูก</strong> ในช่วง {analytics.period.days} วันที่ผ่านมา
                </span>
              </div>
            )}

            {analytics.netChange === 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-600">➡️</span>
                <span>
                  ผลผลิตคงที่ ไม่มีการเปลี่ยนแปลงสุทธิในช่วง {analytics.period.days} วันที่ผ่านมา
                </span>
              </div>
            )}

            {analytics.increaseEvents > analytics.decreaseEvents && (
              <div className="flex items-start gap-2">
                <span className="text-blue-600">📈</span>
                <span>
                  แนวโน้มเป็นบวก: มีการเพิ่มผลผลิต {analytics.increaseEvents} ครั้ง มากกว่าการลดลง {analytics.decreaseEvents} ครั้ง
                </span>
              </div>
            )}

            {analytics.yieldVelocity > 1 && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">🚀</span>
                <span>
                  การเจริญเติบโตรวดเร็ว: เพิ่มขึ้นเฉลี่ย {formatDecimal(analytics.yieldVelocity)} ลูกต่อวัน
                </span>
              </div>
            )}

            {analytics.yieldVelocity < -0.5 && (
              <div className="flex items-start gap-2">
                <span className="text-orange-600">🔍</span>
                <span>
                  ควรตรวจสอบ: ผลผลิตลดลงต่อเนื่อง {formatDecimal(Math.abs(analytics.yieldVelocity))} ลูกต่อวัน
                </span>
              </div>
            )}

            {(analytics.increaseEvents + analytics.decreaseEvents) === 0 && (
              <div className="flex items-start gap-2">
                <span className="text-gray-600">📝</span>
                <span>
                  ไม่มีข้อมูลการเปลี่ยนแปลงในช่วงเวลานี้ ลองเพิ่มการบันทึกผลผลิตเพื่อติดตามแนวโน้ม
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}