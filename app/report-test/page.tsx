'use client'

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ReportTestPage() {
  const [loading, setLoading] = useState(true)

  // Simulate data loading
  useEffect(() => {
    console.log('ReportTestPage: Starting data simulation')
    const timer = setTimeout(() => {
      console.log('ReportTestPage: Simulated data loaded')
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Mock data for testing
  const mockTreeStats = {
    total: 150,
    alive: 140,
    dead: 10,
    totalFruits: 2500,
    fruiting: 85,
    avgFruit: "17.86"
  }

  const mockCostStats = {
    totalCost: 125000,
    avgMonthlyCost: 10416
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardContent className="p-8 text-center">
              <div className="h-6 bg-gray-200 rounded mb-4 mx-auto w-48"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-32"></div>
              <p className="text-gray-600">กำลังโหลดข้อมูลทดสอบ...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              📊 รายงานทดสอบ
            </h1>
            <p className="text-xl text-gray-600 mb-8">ข้อมูลจำลองสำหรับทดสอบระบบ</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/report">
                  📈 รายงานจริง
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/" >
                  🏠 หน้าหลัก
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Tree Statistics */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">🌳 สถิติต้นไม้ (ข้อมูลทดสอบ)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Trees */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">จำนวนต้นทั้งหมด</p>
                    <p className="text-3xl font-bold">{mockTreeStats.total}</p>
                  </div>
                  <div className="text-4xl opacity-80">🌳</div>
                </div>
              </CardContent>
            </Card>

            {/* Alive Trees */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">ต้นที่มีชีวิต</p>
                    <p className="text-3xl font-bold">{mockTreeStats.alive}</p>
                    <p className="text-emerald-200 text-xs">
                      {((mockTreeStats.alive / mockTreeStats.total) * 100).toFixed(1)}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">🟢</div>
                </div>
              </CardContent>
            </Card>

            {/* Dead Trees */}
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">ต้นที่ตายแล้ว</p>
                    <p className="text-3xl font-bold">{mockTreeStats.dead}</p>
                    <p className="text-red-200 text-xs">
                      {((mockTreeStats.dead / mockTreeStats.total) * 100).toFixed(1)}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">💀</div>
                </div>
              </CardContent>
            </Card>

            {/* Total Fruits */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">จำนวนผลรวม</p>
                    <p className="text-3xl font-bold">{mockTreeStats.totalFruits}</p>
                  </div>
                  <div className="text-4xl opacity-80">🍈</div>
                </div>
              </CardContent>
            </Card>

            {/* Fruiting Trees */}
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">ต้นที่มีผล</p>
                    <p className="text-3xl font-bold">{mockTreeStats.fruiting}</p>
                    <p className="text-yellow-200 text-xs">
                      {((mockTreeStats.fruiting / mockTreeStats.total) * 100).toFixed(1)}% ของทั้งหมด
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">🌼</div>
                </div>
              </CardContent>
            </Card>

            {/* Average Fruit */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">ผลเฉลี่ยต่อต้น</p>
                    <p className="text-3xl font-bold">{mockTreeStats.avgFruit}</p>
                    <p className="text-purple-200 text-xs">ผล/ต้น</p>
                  </div>
                  <div className="text-4xl opacity-80">📦</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cost Summary */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">💰 สรุปค่าใช้จ่าย (ข้อมูลทดสอบ)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Cost */}
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm">ค่าใช้จ่ายรวม</p>
                    <p className="text-3xl font-bold">{mockCostStats.totalCost.toLocaleString()}</p>
                    <p className="text-indigo-200 text-xs">บาท</p>
                  </div>
                  <div className="text-4xl opacity-80">💸</div>
                </div>
              </CardContent>
            </Card>

            {/* Average Monthly Cost */}
            <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm">ค่าใช้จ่ายเฉลี่ย/เดือน</p>
                    <p className="text-3xl font-bold">{mockCostStats.avgMonthlyCost.toLocaleString()}</p>
                    <p className="text-pink-200 text-xs">บาท/เดือน</p>
                  </div>
                  <div className="text-4xl opacity-80">📊</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">✅ การทดสอบสำเร็จ</h2>
            <p className="text-blue-700 mb-4">
              หน้ารายงานทดสอบทำงานได้ปกติ แสดงว่าปัญหาอยู่ที่การโหลดข้อมูลจากฐานข้อมูล
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/report">
                  ลองหน้ารายงานจริง
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  กลับหน้าหลัก
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}