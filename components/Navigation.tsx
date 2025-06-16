'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function Navigation() {
  const { user, userRole, signOut, isHydrated } = useAuth()

  if (!user || !isHydrated) return null

  return (
    <div className="bg-white shadow-sm border-b mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-700">
            🌿 สวนวิสุทธิ์ศิริ
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600" suppressHydrationWarning>
              สวัสดี, {user.email}
              {userRole === 'admin' && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  ผู้ดูแลระบบ
                </span>
              )}
            </span>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
            >
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NavigationCard() {
  const { userRole, isHydrated } = useAuth()

  if (!isHydrated) {
    // Show loading state during hydration
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    )
  }

  const menuItems = [
    {
      href: '/logs',
      title: '➕ บันทึกข้อมูลต้นไม้',
      description: 'เพิ่มข้อมูลปุ๋ย น้ำ รูปภาพ',
      bgColor: 'bg-green-100 hover:bg-green-200',
    },
    {
      href: '/gallery',
      title: '🖼️ แกลเลอรีรูปภาพ',
      description: 'ดูภาพที่บันทึกไว้',
      bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    },
    {
      href: '/report',
      title: '📊 รายงานข้อมูล',
      description: 'ดูสรุปข้อมูลการดูแลต้นไม้',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
    },
  ]

  // Add admin menu for admin users
  if (userRole === 'admin') {
    menuItems.push({
      href: '/admin',
      title: '⚙️ จัดการระบบ',
      description: 'เพิ่ม/แก้ไขปุ๋ย ยา ผู้ใช้',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className={`${item.bgColor} p-6 cursor-pointer transition-colors`}>
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  )
}