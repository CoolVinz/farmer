'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'
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

export default function HomePage() {
  const isHydrated = true
  const [stats, setStats] = useState<DashboardStats>({
    totalTrees: 0,
    totalLogs: 0,
    totalCosts: 0,
    totalVarieties: 0,
    recentActivity: '-'
  })
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('สวัสดี')

  useEffect(() => {
    fetchDashboardStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated])

  useEffect(() => {
    // Set greeting only on client side to avoid hydration mismatch
    if (isHydrated) {
      const currentHour = new Date().getHours()
      const timeGreeting = currentHour < 12 ? 'สวัสดีตอนเช้า' : currentHour < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'
      setGreeting(timeGreeting)
    }
  }, [isHydrated])

  async function fetchDashboardStats() {
    try {
      // Only fetch if hydrated to prevent SSR issues
      if (!isHydrated) return

      // Fetch counts from multiple tables with better error handling
      const results = await Promise.allSettled([
        supabase.from('trees').select('*', { count: 'exact', head: true }),
        supabase.from('tree_logs').select('*', { count: 'exact', head: true }),
        supabase.from('tree_costs').select('*', { count: 'exact', head: true }),
        supabase.from('varieties').select('*', { count: 'exact', head: true }),
        supabase.from('tree_logs').select('activity_type, created_at').order('created_at', { ascending: false }).limit(1)
      ])

      setStats({
        totalTrees: results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0,
        totalLogs: results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0,
        totalCosts: results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0,
        totalVarieties: results[3].status === 'fulfilled' ? (results[3].value.count || 0) : 0,
        recentActivity: results[4].status === 'fulfilled' && results[4].value.data?.[0]?.activity_type 
          ? results[4].value.data[0].activity_type 
          : 'ยังไม่มีกิจกรรม'
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set default values on error
      setStats({
        totalTrees: 0,
        totalLogs: 0,
        totalCosts: 0,
        totalVarieties: 0,
        recentActivity: 'ไม่สามารถโหลดข้อมูลได้'
      })
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      href: '/logs',
      title: 'บันทึกข้อมูลต้นไม้',
      description: 'เพิ่มข้อมูลปุ๋ย น้ำ รูปภาพ',
      icon: '➕',
      bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
      textColor: 'text-white',
    },
    {
      href: '/gallery',
      title: 'แกลเลอรีรูปภาพ',
      description: 'ดูภาพที่บันทึกไว้',
      icon: '🖼️',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      textColor: 'text-white',
    },
    {
      href: '/report',
      title: 'รายงานข้อมูล',
      description: 'ดูสรุปข้อมูลการดูแลต้นไม้',
      icon: '📊',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      textColor: 'text-white',
    },
  ]

  // Add admin menu
  menuItems.push({
    href: '/admin',
    title: 'จัดการระบบ',
    description: 'เพิ่ม/แก้ไขปุ๋ย ยา ผู้ใช้',
    icon: '⚙️',
    bgColor: 'bg-gradient-to-br from-gray-400 to-gray-600',
    textColor: 'text-white',
  })

  return (
    <div>
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50 min-h-[40vh] flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-12 w-full">
          <div className="text-center">
            <div className="mb-4">
              <span className="text-6xl mb-4 block">🌿</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              สวนวิสุทธิ์ศิริ
            </h1>
            <p className="text-xl text-gray-600 mb-2">ระบบจัดการสวนทุเรียนครบวงจร</p>
            <p className="text-lg text-gray-500" suppressHydrationWarning>
              {greeting} 👋
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-700">กิจกรรมล่าสุด</h3>
                <p className="text-gray-600">{loading ? 'กำลังโหลด...' : stats.recentActivity}</p>
              </div>
              <Link href="/logs">
                <Button variant="outline" size="sm">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Menu */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">เมนูหลัก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className={`${item.bgColor} ${item.textColor} hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border-0`}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-center">การดำเนินการด่วน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/logs/add-single">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  ➕ เพิ่มบันทึกต้นไม้
                </Button>
              </Link>
              <Link href="/logs/add-batch">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  📝 เพิ่มบันทึกแปลง
                </Button>
              </Link>
              <Link href="/report/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  📊 ดูแดชบอร์ด
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            สวนวิสุทธิ์ศิริ - ระบบจัดการสวนทุเรียน
          </p>
          <p className="text-gray-400 text-xs mt-1">
            พัฒนาด้วย Next.js และ Supabase
          </p>
        </div>
      </main>
    </div>
  )
}
