'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SimpleReportPage() {
  const [loading] = useState(false)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              📊 รายงานภาพรวมสวน
            </h1>
            <p className="text-xl text-gray-600 mb-8">สวนวิสุทธิ์ศิริ - ข้อมูลสถิติและการวิเคราะห์</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/">
                  🏠 หน้าหลัก
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/report-test">
                  📊 รายงานทดสอบ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Stats */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">🌳 สถิติต้นไม้</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">จำนวนต้นทั้งหมด</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="text-4xl opacity-80">🌳</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">ต้นที่มีชีวิต</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="text-4xl opacity-80">🟢</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">จำนวนผลรวม</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="text-4xl opacity-80">🍈</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Notice */}
        <section className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-2">📋 หมายเหตุ</h3>
              <p className="text-blue-700">
                นี่คือหน้ารายงานแบบง่าย ไม่มีการเชื่อมต่อฐานข้อมูล
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/report">
                    📊 รายงานจริง (มีฐานข้อมูล)
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/report-test">
                    🧪 รายงานทดสอบ (ข้อมูลจำลอง)
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}