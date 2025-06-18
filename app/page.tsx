'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface DashboardStats {
  totalTrees: number
  totalLogs: number
  totalCosts: number
  totalVarieties: number
  recentActivity: string
  monthlyYield: number
  healthyTrees: number
  monthlyRevenue: number
}

export default function HomePage() {
  const isHydrated = true
  const [stats, setStats] = useState<DashboardStats>({
    totalTrees: 0,
    totalLogs: 0,
    totalCosts: 0,
    totalVarieties: 0,
    recentActivity: '-',
    monthlyYield: 0,
    healthyTrees: 0,
    monthlyRevenue: 0
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

      const totalTrees = results[0].status === 'fulfilled' ? (results[0].value.count || 0) : 0
      const totalLogs = results[1].status === 'fulfilled' ? (results[1].value.count || 0) : 0
      const totalCosts = results[2].status === 'fulfilled' ? (results[2].value.count || 0) : 0
      
      setStats({
        totalTrees,
        totalLogs,
        totalCosts,
        totalVarieties: results[3].status === 'fulfilled' ? (results[3].value.count || 0) : 0,
        recentActivity: results[4].status === 'fulfilled' && results[4].value.data?.[0]?.activity_type 
          ? results[4].value.data[0].activity_type 
          : 'ยังไม่มีกิจกรรม',
        monthlyYield: Math.round((totalTrees * 1.2) + (totalLogs * 0.5)), // Mock calculation
        healthyTrees: Math.round(totalTrees * 0.95), // 95% healthy
        monthlyRevenue: Math.round((totalTrees * 250) + (totalLogs * 50)) // Mock revenue calculation
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Set default values on error
      setStats({
        totalTrees: 0,
        totalLogs: 0,
        totalCosts: 0,
        totalVarieties: 0,
        recentActivity: 'ไม่สามารถโหลดข้อมูลได้',
        monthlyYield: 0,
        healthyTrees: 0,
        monthlyRevenue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toLocaleString()
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] text-[#121a0f]">
      <style jsx>{`
        :root {
          --primary-color: #53d22c;
          --primary-text-color: #121a0f;
          --secondary-text-color: #3a5734; 
          --background-color: #f9fbf9;
          --card-background-color: #ffffff; 
          --card-border-color: #e0e7de; 
          --metric-card-background-color: #f0f7ef; 
          --positive-change-color: #078821;
          --negative-change-color: #e71f08;
          --chart-bar-color: #a3cca3;
          --chart-line-color: #53d22c;
          --chart-fill-color: #e0f7da; 
        }
        .metric-card {
          background-color: var(--metric-card-background-color);
          border-radius: 12px;
          padding: 24px;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .chart-card {
          background-color: var(--card-background-color);
          border: 1px solid var(--card-border-color);
          border-radius: 12px;
          padding: 24px;
          transition: box-shadow 0.2s ease-in-out;
        }
        .chart-card:hover {
          box-shadow: 0 8px 16px rgba(0,0,0,0.05);
        }
      `}</style>
      
      <Navigation />
      
      <main className="px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8">
        <div className="layout-content-container flex flex-col max-w-screen-xl w-full">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8 px-4">
            <div className="flex flex-col">
              <h1 className="text-[#121a0f] tracking-tight text-3xl font-bold leading-tight" suppressHydrationWarning>
                สวนวิสุทธิ์ศิริ Dashboard
              </h1>
              <p className="text-[#3a5734] text-base font-normal leading-normal" suppressHydrationWarning>
                {greeting}! นี่คือภาพรวมการดำเนินงานของสวนของคุณ
              </p>
            </div>
            <Link href="/logs/add-single">
              <button className="bg-[#53d22c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors shadow-md hover:shadow-lg">
                เพิ่มข้อมูลใหม่
              </button>
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            <div className="metric-card flex flex-col gap-2">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">ผลผลิตรวม</p>
              <p className="text-[#121a0f] tracking-tight text-4xl font-bold leading-tight">
                {loading ? '...' : formatNumber(stats.monthlyYield)} กก.
              </p>
              <p className="text-[#3a5734] text-sm font-normal">อัปเดตเมื่อ 2 ชั่วโมงที่แล้ว</p>
            </div>
            
            <div className="metric-card flex flex-col gap-2">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">สถานะต้นไม้</p>
              <div className="flex items-center gap-2">
                <p className="text-[#121a0f] tracking-tight text-4xl font-bold leading-tight">แข็งแรง</p>
                <span className="bg-green-100 text-[#078821] text-xs font-semibold px-2 py-0.5 rounded-full">
                  {loading ? '...' : Math.round((stats.healthyTrees / stats.totalTrees) * 100 || 0)}% ปกติ
                </span>
              </div>
              <p className="text-[#3a5734] text-sm font-normal">การตรวจสอบแบบเรียลไทม์</p>
            </div>
            
            <div className="metric-card flex flex-col gap-2">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">ผลประกอบการทางการเงิน</p>
              <p className="text-[#121a0f] tracking-tight text-4xl font-bold leading-tight">
                ฿{loading ? '...' : formatNumber(stats.monthlyRevenue)}
              </p>
              <p className="text-[#078821] text-sm font-medium">
                + ฿{loading ? '...' : formatNumber(Math.round(stats.monthlyRevenue * 0.1))} เทียบเดือนที่แล้ว
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-8">
            {/* Tree Distribution */}
            <div className="chart-card lg:col-span-1 flex flex-col gap-3">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">การกระจายต้นไม้</p>
              <p className="text-[#121a0f] tracking-tight text-3xl font-bold leading-tight truncate">
                {loading ? '...' : stats.totalTrees} ต้น <span className="text-base font-medium text-[#3a5734]">(ทั้งหมด)</span>
              </p>
              <div className="flex gap-2 items-center">
                <p className="text-[#3a5734] text-sm font-normal leading-normal">เปรียบเทียบปีที่แล้ว</p>
                <span className="text-[#078821] text-sm font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.56l-2.47 2.47a.75.75 0 0 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L10.75 5.56v10.69A.75.75 0 0 1 10 17Z" fillRule="evenodd"></path>
                  </svg>
                  +15%
                </span>
              </div>
              <div className="grid min-h-[200px] grid-flow-col gap-4 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '70%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">หมอนทอง</p>
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '40%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">ชะนี</p>
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '55%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">กันยาว</p>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="chart-card lg:col-span-1 flex flex-col gap-3">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">บันทึกกิจกรรม</p>
              <p className="text-[#121a0f] tracking-tight text-3xl font-bold leading-tight truncate">
                {loading ? '...' : stats.totalLogs} <span className="text-base font-medium text-[#3a5734]">(รายการ)</span>
              </p>
              <div className="flex gap-2 items-center">
                <p className="text-[#3a5734] text-sm font-normal leading-normal">เปรียบเทียบเดือนที่แล้ว</p>
                <span className="text-[#078821] text-sm font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.56l-2.47 2.47a.75.75 0 0 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L10.75 5.56v10.69A.75.75 0 0 1 10 17Z" fillRule="evenodd"></path>
                  </svg>
                  +8%
                </span>
              </div>
              <div className="grid min-h-[200px] grid-flow-col gap-4 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '80%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">บันทึกรายต้น</p>
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '95%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">บันทึกแปลง</p>
                <div className="rounded-t-md bg-[#a3cca3] w-full transition-all duration-500 ease-out" style={{height: '60%'}}></div>
                <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">ค่าใช้จ่าย</p>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="chart-card lg:col-span-1 flex flex-col gap-3">
              <p className="text-[#121a0f] text-lg font-semibold leading-normal">แนวโน้มรายได้รายเดือน</p>
              <p className="text-[#121a0f] tracking-tight text-3xl font-bold leading-tight truncate">
                ฿{loading ? '...' : formatNumber(Math.round(stats.monthlyRevenue / 12))} <span className="text-base font-medium text-[#3a5734]">(ปัจจุบัน)</span>
              </p>
              <div className="flex gap-2 items-center">
                <p className="text-[#3a5734] text-sm font-normal leading-normal">รวมปีนี้</p>
                <span className="text-[#078821] text-sm font-semibold flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.56l-2.47 2.47a.75.75 0 0 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L10.75 5.56v10.69A.75.75 0 0 1 10 17Z" fillRule="evenodd"></path>
                  </svg>
                  +22%
                </span>
              </div>
              <div className="flex min-h-[200px] flex-1 flex-col gap-4 py-4">
                <svg fill="none" height="148" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%">
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_dashboard)"></path>
                  <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#53d22c" strokeLinecap="round" strokeWidth="3"></path>
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_dashboard" x1="236" x2="236" y1="1" y2="149">
                      <stop stopColor="#e0f7da"></stop>
                      <stop offset="1" stopColor="#e0f7da" stopOpacity="0"></stop>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-around">
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">ม.ค.</p>
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">ก.พ.</p>
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">มี.ค.</p>
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">เม.ย.</p>
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">พ.ค.</p>
                  <p className="text-[#3a5734] text-xs font-semibold leading-normal tracking-[0.015em]">มิ.ย.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-6">
            <Link href="/logs/add-single" className="chart-card text-center hover:bg-opacity-95 transition-colors">
              <div className="text-4xl mb-3">🌳</div>
              <h3 className="text-[#121a0f] font-semibold mb-1">บันทึกรายต้น</h3>
              <p className="text-[#3a5734] text-sm">เพิ่มข้อมูลต้นไม้</p>
            </Link>
            
            <Link href="/logs/add-batch" className="chart-card text-center hover:bg-opacity-95 transition-colors">
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="text-[#121a0f] font-semibold mb-1">บันทึกแปลง</h3>
              <p className="text-[#3a5734] text-sm">จัดการทั้งแปลง</p>
            </Link>
            
            <Link href="/gallery" className="chart-card text-center hover:bg-opacity-95 transition-colors">
              <div className="text-4xl mb-3">🖼️</div>
              <h3 className="text-[#121a0f] font-semibold mb-1">แกลเลอรี</h3>
              <p className="text-[#3a5734] text-sm">ดูรูปภาพ</p>
            </Link>
            
            <Link href="/admin" className="chart-card text-center hover:bg-opacity-95 transition-colors">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-[#121a0f] font-semibold mb-1">จัดการระบบ</h3>
              <p className="text-[#3a5734] text-sm">ตั้งค่าข้อมูล</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
