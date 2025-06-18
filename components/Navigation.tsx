'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'

export function Navigation() {
  return (
    <div className="bg-white shadow-sm border-b mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-700">
            🌿 สวนวิสุทธิ์ศิริ
          </Link>
        </div>
      </div>
    </div>
  )
}

export function NavigationCard() {
  const menuItems = [
    {
      href: '/logs',
      title: '➕ บันทึกข้อมูลต้นไม้',
      description: 'เพิ่มข้อมูลปุ๋ย น้ำ รูปภาพ',
      bgColor: 'bg-green-100 hover:bg-green-200',
    },
    {
      href: '/sections',
      title: '🌿 จัดการแปลงย่อย',
      description: 'จัดการข้อมูลแปลงย่อยและต้นไม้',
      bgColor: 'bg-emerald-100 hover:bg-emerald-200',
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
    {
      href: '/admin',
      title: '⚙️ จัดการระบบ',
      description: 'เพิ่ม/แก้ไขปุ๋ย ยา ผู้ใช้',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    }
  ]

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