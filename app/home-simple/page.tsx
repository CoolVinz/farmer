'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SimpleHomePage() {
  const [stats, setStats] = useState({
    totalTrees: 0,
    totalLogs: 0,
    totalCosts: 0,
    totalVarieties: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSimpleStats()
  }, [])

  async function fetchSimpleStats() {
    try {
      // Simple direct queries without complex auth checks
      const [trees, logs, costs, varieties] = await Promise.all([
        supabase.from('trees').select('id'),
        supabase.from('tree_logs').select('id'),
        supabase.from('tree_costs').select('id'),
        supabase.from('varieties').select('id')
      ])

      setStats({
        totalTrees: trees.data?.length || 0,
        totalLogs: logs.data?.length || 0,
        totalCosts: costs.data?.length || 0,
        totalVarieties: varieties.data?.length || 0
      })
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      href: '/temp-access',
      title: 'ดูข้อมูลสรุป',
      description: 'ดูข้อมูลต้นไม้และกิจกรรม',
      icon: '📊',
      bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
    },
    {
      href: '/logs/all',
      title: 'บันทึกทั้งหมด',
      description: 'ดูบันทึกกิจกรรมทั้งหมด',
      icon: '📝',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
    },
    {
      href: '/gallery',
      title: 'แกลเลอรีรูปภาพ',
      description: 'ดูภาพที่บันทึกไว้',
      icon: '🖼️',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    },
    {
      href: '/report',
      title: 'รายงานข้อมูล',
      description: 'ดูสรุปข้อมูลการดูแลต้นไม้',
      icon: '📈',
      bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-green-700">🌿 สวนวิสุทธิ์ศิริ</h1>
            <div className="flex gap-2">
              <Link href="/dashboard-test">
                <Button variant="outline" size="sm">🧪 Test Data</Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="sm">🔐 เข้าสู่ระบบ</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <span className="text-6xl mb-4 block">🌿</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            สวนวิสุทธิ์ศิริ
          </h1>
          <p className="text-xl text-gray-600 mb-8">ระบบจัดการสวนทุเรียนครบวงจร</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
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

        {/* Main Menu */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">เมนูหลัก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Card className={`${item.bgColor} text-white hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl border-0`}>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Data Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center text-blue-800">📊 สรุปข้อมูลสวน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.totalTrees}</div>
                <div className="text-sm text-gray-600">ต้นทุเรียน</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
                <div className="text-sm text-gray-600">บันทึกการดูแล</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalCosts}</div>
                <div className="text-sm text-gray-600">รายการค่าใช้จ่าย</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.totalVarieties}</div>
                <div className="text-sm text-gray-600">พันธุ์ทุเรียน</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 py-8">
          <p className="text-gray-500 text-sm">
            สวนวิสุทธิ์ศิริ - ระบบจัดการสวนทุเรียน
          </p>
          <p className="text-gray-400 text-xs mt-1">
            เข้าถึงข้อมูลได้โดยไม่ต้องล็อกอิน
          </p>
        </div>
      </main>
    </div>
  )
}