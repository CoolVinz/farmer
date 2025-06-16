'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardStats {
  totalTrees: number
  totalLogs: number
  totalCosts: number
  totalVarieties: number
  recentActivity: string
}

export default function DashboardTestPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTrees: 0,
    totalLogs: 0,
    totalCosts: 0,
    totalVarieties: 0,
    recentActivity: '-'
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  async function fetchDashboardStats() {
    setLoading(true)
    const errorList: string[] = []
    
    try {
      console.log('🔍 Starting data fetch...')
      
      // Test basic connection first
      const { data: testData, error: testError } = await supabase
        .from('trees')
        .select('id')
        .limit(1)
        
      if (testError) {
        console.error('❌ Basic connection test failed:', testError)
        errorList.push(`Connection test: ${testError.message}`)
      } else {
        console.log('✅ Basic connection successful')
      }

      // Fetch trees count
      let totalTrees = 0
      try {
        const { count, error } = await supabase
          .from('trees')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error('❌ Trees count error:', error)
          errorList.push(`Trees: ${error.message}`)
        } else {
          totalTrees = count || 0
          console.log('✅ Trees count:', totalTrees)
        }
      } catch (err) {
        console.error('❌ Trees fetch exception:', err)
        errorList.push(`Trees exception: ${err}`)
      }

      // Fetch tree_logs count
      let totalLogs = 0
      try {
        const { count, error } = await supabase
          .from('tree_logs')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error('❌ Logs count error:', error)
          errorList.push(`Logs: ${error.message}`)
        } else {
          totalLogs = count || 0
          console.log('✅ Logs count:', totalLogs)
        }
      } catch (err) {
        console.error('❌ Logs fetch exception:', err)
        errorList.push(`Logs exception: ${err}`)
      }

      // Fetch tree_costs count
      let totalCosts = 0
      try {
        const { count, error } = await supabase
          .from('tree_costs')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error('❌ Costs count error:', error)
          errorList.push(`Costs: ${error.message}`)
        } else {
          totalCosts = count || 0
          console.log('✅ Costs count:', totalCosts)
        }
      } catch (err) {
        console.error('❌ Costs fetch exception:', err)
        errorList.push(`Costs exception: ${err}`)
      }

      // Fetch varieties count
      let totalVarieties = 0
      try {
        const { count, error } = await supabase
          .from('varieties')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.error('❌ Varieties count error:', error)
          errorList.push(`Varieties: ${error.message}`)
        } else {
          totalVarieties = count || 0
          console.log('✅ Varieties count:', totalVarieties)
        }
      } catch (err) {
        console.error('❌ Varieties fetch exception:', err)
        errorList.push(`Varieties exception: ${err}`)
      }

      // Fetch recent activity
      let recentActivity = 'ยังไม่มีกิจกรรม'
      try {
        const { data, error } = await supabase
          .from('tree_logs')
          .select('activity_type, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (error) {
          console.error('❌ Recent activity error:', error)
          errorList.push(`Recent activity: ${error.message}`)
        } else if (data && data.length > 0) {
          recentActivity = data[0].activity_type || 'ไม่ระบุกิจกรรม'
          console.log('✅ Recent activity:', recentActivity)
        }
      } catch (err) {
        console.error('❌ Recent activity exception:', err)
        errorList.push(`Recent activity exception: ${err}`)
      }

      setStats({
        totalTrees,
        totalLogs,
        totalCosts,
        totalVarieties,
        recentActivity
      })

      setErrors(errorList)
      
    } catch (error) {
      console.error('❌ General fetch error:', error)
      errorList.push(`General error: ${error}`)
      setErrors(errorList)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🧪 Dashboard Data Test</h1>
        <p className="text-gray-600 mb-4">
          Testing data fetch without authentication requirements
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={fetchDashboardStats} disabled={loading}>
            {loading ? 'กำลังโหลด...' : '🔄 โหลดข้อมูลใหม่'}
          </Button>
          <Link href="/temp-access">
            <Button variant="outline">📊 ดูข้อมูลแบบง่าย</Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline">🔐 เข้าสู่ระบบ</Button>
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">❌ ข้อผิดพลาดที่พบ</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-600 text-sm">{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalTrees}</div>
              <div className="text-sm opacity-90">ต้นไม้ทั้งหมด</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalLogs}</div>
              <div className="text-sm opacity-90">บันทึกกิจกรรม</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalCosts}</div>
              <div className="text-sm opacity-90">รายการค่าใช้จ่าย</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalVarieties}</div>
              <div className="text-sm opacity-90">พันธุ์ทุเรียน</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mb-8 border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div>
            <h3 className="font-semibold text-gray-700">กิจกรรมล่าสุด</h3>
            <p className="text-gray-600">{loading ? 'กำลังโหลด...' : stats.recentActivity}</p>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>🔧 Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Errors count:</strong> {errors.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}