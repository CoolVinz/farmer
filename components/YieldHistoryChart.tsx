"use client"

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { YieldTrendData } from '@/lib/utils/yieldCalculations'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface YieldHistoryChartProps {
  data: YieldTrendData[]
  period: string
  loading?: boolean
}

export function YieldHistoryChart({ data, period, loading = false }: YieldHistoryChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  // Prepare chart data
  const chartData: ChartData<'line'> = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('th-TH', { 
        month: 'short', 
        day: 'numeric',
        year: data.length > 30 ? '2-digit' : undefined
      })
    }),
    datasets: [
      {
        label: 'จำนวนผลไม้สะสม',
        data: data.map(item => item.yield),
        borderColor: 'rgb(34, 197, 94)', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        pointBackgroundColor: data.map(item => {
          if (item.change > 0) return 'rgb(34, 197, 94)' // green for increase
          if (item.change < 0) return 'rgb(239, 68, 68)' // red for decrease
          return 'rgb(107, 114, 128)' // gray for no change
        }),
        pointBorderColor: data.map(item => {
          if (item.change > 0) return 'rgb(21, 128, 61)' // green-700
          if (item.change < 0) return 'rgb(185, 28, 28)' // red-700
          return 'rgb(75, 85, 99)' // gray-600
        }),
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.1,
        fill: true
      }
    ]
  }

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex
            const item = data[index]
            return new Date(item.date).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          },
          label: (context) => {
            const index = context.dataIndex
            const item = data[index]
            const lines = [
              `จำนวนผลไม้: ${item.yield} ลูก`,
              `การเปลี่ยนแปลง: ${item.change > 0 ? '+' : ''}${item.change} ลูก`,
              `เหตุผล: ${item.reason}`,
              `ประเภท: ${getActivityTypeLabel(item.activityType)}`
            ]
            return lines
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'วันที่',
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxTicksLimit: 10,
          font: {
            family: 'Inter, sans-serif',
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'จำนวนผลไม้ (ลูก)',
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          callback: function(value) {
            return `${value} ลูก`
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  }

  function getActivityTypeLabel(activityType: string): string {
    const labels: Record<string, string> = {
      'yield_update': 'อัปเดตผลผลิต',
      'harvest': 'เก็บเกี่ยว',
      'maintenance': 'การดูแล',
      'fertilizer': 'ใส่ปุ๋ย',
      'pruning': 'ตัดแต่ง'
    }
    return labels[activityType] || activityType
  }

  function getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      '7days': '7 วันที่ผ่านมา',
      '30days': '30 วันที่ผ่านมา',
      '90days': '90 วันที่ผ่านมา',
      '1year': '1 ปีที่ผ่านมา',
      'all': 'ทั้งหมด'
    }
    return labels[period] || period
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 แนวโน้มผลผลิต</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">กำลังโหลดข้อมูล...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 แนวโน้มผลผลิต - {getPeriodLabel(period)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-lg font-medium">ไม่มีข้อมูลการเปลี่ยนแปลงผลผลิต</p>
            <p className="text-sm mt-1">เริ่มต้นโดยการอัปเดตจำนวนผลไม้หรือบันทึกการเก็บเกี่ยว</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📈 แนวโน้มผลผลิต - {getPeriodLabel(period)}</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>เพิ่มขึ้น</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>ลดลง</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
        
        {/* Summary Info */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-gray-900">
              {data.length}
            </div>
            <div className="text-xs text-gray-600">จุดข้อมูล</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-green-600">
              {data[data.length - 1]?.yield || 0}
            </div>
            <div className="text-xs text-gray-600">ผลไม้ปัจจุบัน</div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-blue-600">
              {Math.max(...data.map(d => d.yield))}
            </div>
            <div className="text-xs text-gray-600">สูงสุด</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-lg font-semibold text-orange-600">
              {Math.min(...data.map(d => d.yield))}
            </div>
            <div className="text-xs text-gray-600">ต่ำสุด</div>
          </div>
        </div>

        {/* Recent Events */}
        {data.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">เหตุการณ์ล่าสุด:</h4>
            <div className="space-y-1">
              {data.slice(-3).reverse().map((item, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-center justify-between">
                  <span>
                    {new Date(item.date).toLocaleDateString('th-TH')} - {item.reason}
                  </span>
                  <span className={`font-medium ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {item.change > 0 ? '+' : ''}{item.change} ลูก
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}