'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface TreeStats {
  total: number
  alive: number
  dead: number
  totalFruits: number
  fruiting: number
  avgFruit: string
  varietyStats: { [key: string]: number }
  statusPercentages: { alive: number; dead: number }
}

interface CostStats {
  totalCost: number
  costByActivity: { [key: string]: number }
  recentCosts: any[]
  avgMonthlyCost: number
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center text-gray-500">
        <p>กำลังโหลดข้อมูล...</p>
        <p className="text-sm">หากติดค้างนานเกินไป ให้ตรวจสอบการเชื่อมต่อฐานข้อมูล</p>
      </div>
    </div>
  )
}

function TreeStatsSection({ stats, loading }: { stats: TreeStats; loading: boolean }) {
  if (loading) return <LoadingSkeleton />

  // Show empty state if no trees
  if (stats.total === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูลต้นไม้</h3>
          <p className="text-gray-600 mb-6">เริ่มต้นด้วยการเพิ่มต้นไม้แรกของคุณ</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/trees/create">
                เพิ่มต้นไม้ใหม่
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin-prisma">
                ตั้งค่าระบบ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const healthPercentage = stats.total > 0 ? ((stats.alive / stats.total) * 100).toFixed(1) : '0'
  const fruitingPercentage = stats.total > 0 ? ((stats.fruiting / stats.total) * 100).toFixed(1) : '0'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Trees */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">จำนวนต้นทั้งหมด</p>
              <p className="text-3xl font-bold">{stats.total}</p>
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
              <p className="text-3xl font-bold">{stats.alive}</p>
              <p className="text-emerald-200 text-xs">{healthPercentage}% ของทั้งหมด</p>
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
              <p className="text-3xl font-bold">{stats.dead}</p>
              <p className="text-red-200 text-xs">{(100 - parseFloat(healthPercentage)).toFixed(1)}% ของทั้งหมด</p>
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
              <p className="text-3xl font-bold">{stats.totalFruits}</p>
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
              <p className="text-3xl font-bold">{stats.fruiting}</p>
              <p className="text-yellow-200 text-xs">{fruitingPercentage}% ของทั้งหมด</p>
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
              <p className="text-3xl font-bold">{stats.avgFruit}</p>
              <p className="text-purple-200 text-xs">ผล/ต้น</p>
            </div>
            <div className="text-4xl opacity-80">📦</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CostSummarySection({ stats, loading }: { stats: CostStats; loading: boolean }) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Cost */}
      <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">ค่าใช้จ่ายรวม</p>
              <p className="text-3xl font-bold">{stats.totalCost.toLocaleString()}</p>
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
              <p className="text-3xl font-bold">{stats.avgMonthlyCost.toLocaleString()}</p>
              <p className="text-pink-200 text-xs">บาท/เดือน</p>
            </div>
            <div className="text-4xl opacity-80">📊</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportPage() {
  const [trees, setTrees] = useState<any[]>([])
  const [varieties, setVarieties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  async function fetchAllData() {
    try {
      setLoading(true)
      setError(null)

      // Use API endpoints instead of direct Supabase calls
      const [treesResponse, varietiesResponse] = await Promise.all([
        fetch('/api/trees'),
        fetch('/api/varieties')
      ])

      if (!treesResponse.ok || !varietiesResponse.ok) {
        throw new Error('Failed to fetch data from API')
      }

      const treesResult = await treesResponse.json()
      const varietiesResult = await varietiesResponse.json()

      if (treesResult.success) {
        setTrees(treesResult.data || [])
      } else {
        console.error('Trees API error:', treesResult.error)
        throw new Error('Trees API returned error')
      }

      if (varietiesResult.success) {
        setVarieties(varietiesResult.data || [])
      } else {
        console.error('Varieties API error:', varietiesResult.error)
        // Varieties is not critical, continue without error
        setVarieties([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('การโหลดข้อมูลใช้เวลานานเกินไป อาจเป็นเพราะยังไม่มีข้อมูลในฐานข้อมูล')
      toast.error('ไม่สามารถโหลดข้อมูลรายงานได้')
    } finally {
      setLoading(false)
    }
  }

  // Calculate tree statistics safely (using Prisma field names)
  const treeStats: TreeStats = {
    total: Array.isArray(trees) ? trees.length : 0,
    alive: Array.isArray(trees) ? trees.filter((t) => t?.status === "alive").length : 0,
    dead: Array.isArray(trees) ? trees.filter((t) => t?.status === "dead").length : 0,
    totalFruits: Array.isArray(trees) ? trees.reduce((sum, t) => sum + (t?.fruitCount || 0), 0) : 0,
    fruiting: Array.isArray(trees) ? trees.filter((t) => (t?.fruitCount || 0) > 0).length : 0,
    avgFruit: Array.isArray(trees) && trees.length > 0 ? (trees.reduce((sum, t) => sum + (t?.fruitCount || 0), 0) / trees.length).toFixed(2) : "0.00",
    varietyStats: Array.isArray(trees) ? trees.reduce((acc, tree) => {
      if (tree?.variety) {
        acc[tree.variety] = (acc[tree.variety] || 0) + 1
      }
      return acc
    }, {} as { [key: string]: number }) : {},
    statusPercentages: {
      alive: Array.isArray(trees) && trees.length > 0 ? (trees.filter(t => t?.status === "alive").length / trees.length) * 100 : 0,
      dead: Array.isArray(trees) && trees.length > 0 ? (trees.filter(t => t?.status === "dead").length / trees.length) * 100 : 0
    }
  }

  // Simple cost statistics (placeholder for now)
  const costStats: CostStats = {
    totalCost: 0,
    avgMonthlyCost: 0,
    costByActivity: {},
    recentCosts: []
  }

  // Top varieties
  const topVarieties = Object.entries(treeStats.varietyStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  // Show error state if there's an error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 text-2xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-red-700 mb-6">{error}</p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={() => {
                setError(null)
                setLoading(true)
                fetchAllData()
              }} className="bg-red-600 hover:bg-red-700">
                ลองใหม่อีกครั้ง
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/report-test">
                  ดูรายงานทดสอบ
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/">
                  กลับหน้าหลัก
                </Link>
              </Button>
            </div>
            
            <div className="mt-6 text-sm text-gray-600">
              <p>💡 <strong>คำแนะนำ:</strong> หากยังไม่มีข้อมูลในระบบ ให้เพิ่มข้อมูลต้นไม้และบันทึกกิจกรรมก่อน</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                <Link href="/report/dashboard">
                  📈 แดชบอร์ดแบบละเอียด
                </Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/report/cost">
                  💰 รายงานต้นทุน
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  🏠 หน้าหลัก
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Tree Statistics */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🌳 สถิติต้นไม้</h2>
            <p className="text-gray-600">ข้อมูลภาพรวมของต้นทุเรียนในสวน</p>
          </div>
          <TreeStatsSection stats={treeStats} loading={loading} />
        </section>

        {/* Variety Breakdown */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🌱 พันธุ์ยอดนิยม</h2>
            <p className="text-gray-600">พันธุ์ทุเรียนที่มีจำนวนมากที่สุดในสวน</p>
          </div>
          
          {topVarieties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topVarieties.map(([variety, count], index) => (
                <Card key={variety} className={`border-l-4 ${
                  index === 0 ? 'border-l-yellow-500 bg-yellow-50' :
                  index === 1 ? 'border-l-gray-400 bg-gray-50' :
                  'border-l-orange-500 bg-orange-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{variety}</h3>
                        <p className="text-2xl font-bold text-gray-800">{count} ต้น</p>
                        <p className="text-sm text-gray-600">
                          {((count / treeStats.total) * 100).toFixed(1)}% ของทั้งหมด
                        </p>
                      </div>
                      <div className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">ยังไม่มีข้อมูลพันธุ์</h3>
                <p className="text-gray-600 mb-4">เพิ่มต้นไม้ในระบบเพื่อดูสถิติพันธุ์</p>
                <Button asChild>
                  <Link href="/trees/create">
                    เพิ่มต้นไม้ใหม่ →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Cost Summary - Placeholder */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">💰 สรุปค่าใช้จ่าย</h2>
            <p className="text-gray-600">ข้อมูลการลงทุนและต้นทุนการดำเนินงาน</p>
          </div>
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ฟีเจอร์กำลังพัฒนา</h3>
              <p className="text-gray-600 mb-4">ระบบติดตามค่าใช้จ่ายจะพร้อมใช้งานในอนาคต</p>
              <Button asChild variant="outline">
                <Link href="/report/cost">
                  ดูรายงานต้นทุนแบบทดสอบ →
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">การดำเนินการด่วน</h2>
            <p className="text-gray-600">เข้าถึงฟีเจอร์ที่ใช้บ่อยได้อย่างรวดเร็ว</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button asChild className="h-16 bg-green-600 hover:bg-green-700">
              <Link href="/logs/add-single" className="flex flex-col">
                <span className="text-lg mb-1">➕</span>
                <span className="text-sm">เพิ่มบันทึกต้นไม้</span>
              </Link>
            </Button>
            
            <Button asChild className="h-16 bg-blue-600 hover:bg-blue-700">
              <Link href="/logs/add-batch" className="flex flex-col">
                <span className="text-lg mb-1">📝</span>
                <span className="text-sm">เพิ่มบันทึกแปลง</span>
              </Link>
            </Button>
            
            <Button asChild className="h-16 bg-purple-600 hover:bg-purple-700">
              <Link href="/gallery" className="flex flex-col">
                <span className="text-lg mb-1">🖼️</span>
                <span className="text-sm">ดูแกลเลอรี</span>
              </Link>
            </Button>
            
            <Button asChild className="h-16 bg-orange-600 hover:bg-orange-700">
              <Link href="/admin" className="flex flex-col">
                <span className="text-lg mb-1">⚙️</span>
                <span className="text-sm">จัดการระบบ</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Summary Cards */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Health Summary */}
            <Card className="border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="text-green-700">🌿 สุขภาพสวน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>อัตราการรอดตาย</span>
                    <span className="font-bold text-green-600">
                      {((treeStats.alive / treeStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ต้นที่ให้ผล</span>
                    <span className="font-bold text-orange-600">
                      {((treeStats.fruiting / treeStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ผลผลิตเฉลี่ย</span>
                    <span className="font-bold text-purple-600">{treeStats.avgFruit} ผล/ต้น</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Summary */}
            <Card className="border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-700">💼 สรุปการลงทุน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center">
                  <div className="text-gray-400 text-3xl mb-2">💼</div>
                  <p className="text-gray-600">ระบบติดตามค่าใช้จ่ายกำลังพัฒนา</p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/report/cost">
                      ดูรายงานต้นทุน →
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
