'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { AgriTrackSidebar } from '@/components/AgriTrackSidebar'

interface PlotSummary {
  id: string
  code: string
  name: string
  owner?: string
  sectionSpacing?: 'FOUR_BY_FOUR' | 'TEN_BY_TEN'
  area?: number
  description?: string
  sectionCount: number
  treeCount: number
}

export default function PlotsPage() {
  const [plots, setPlots] = useState<PlotSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlots()
  }, [])

  async function fetchPlots() {
    try {
      const response = await fetch('/api/plots?includeTreeCount=true')
      const result = await response.json()
      
      if (result.success) {
        setPlots(result.data)
      } else {
        console.error('Failed to fetch plots:', result.error)
      }
    } catch (error) {
      console.error('Error fetching plots:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
        <style jsx>{`
          :root {
            --primary-color: #53d22c;
            --secondary-color: #ebf2e9;
            --text-primary: #121a0f;
            --text-secondary: #639155;
            --border-color: #d6e5d2;
          }
          .icon-primary { color: var(--text-primary); }
          .icon-secondary { color: var(--text-secondary); }
          .icon-active { color: var(--primary-color); }
          .bg-primary-light { background-color: var(--secondary-color); }
          .border-primary-custom { border-color: var(--primary-color); }
          .text-primary-custom { color: var(--primary-color); }
        `}</style>
        
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-start py-5">
            <AgriTrackSidebar />
            
            <main className="layout-content-container flex flex-col flex-1 px-4">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
                  <p className="text-[var(--text-secondary)]">กำลังโหลดข้อมูลแปลง...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#f9fbf9] group/design-root overflow-x-hidden" style={{fontFamily: 'Manrope, "Noto Sans", sans-serif'}}>
      <style jsx>{`
        :root {
          --primary-color: #53d22c;
          --secondary-color: #ebf2e9;
          --text-primary: #121a0f;
          --text-secondary: #639155;
          --border-color: #d6e5d2;
        }
        .icon-primary { color: var(--text-primary); }
        .icon-secondary { color: var(--text-secondary); }
        .icon-active { color: var(--primary-color); }
        .bg-primary-light { background-color: var(--secondary-color); }
        .border-primary-custom { border-color: var(--primary-color); }
        .text-primary-custom { color: var(--primary-color); }
      `}</style>
      
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-start py-5">
          <AgriTrackSidebar />
          
          <main className="layout-content-container flex flex-col flex-1 px-4">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-center gap-3 p-4 border-b border-[var(--border-color)]">
              <p className="text-[var(--text-primary)] tracking-tight text-[32px] font-bold leading-tight min-w-72">Garden Plots</p>
              <button className="bg-[var(--primary-color)] text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200">
                Add New Tree
              </button>
            </header>

            {/* Plot Cards */}
            <section className="p-4">
              <h2 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Farm Layout</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plots.map((plot) => (
                  <div key={plot.id} className="rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[var(--secondary-color)] rounded-lg flex items-center justify-center">
                          <span className="text-[var(--primary-color)] text-xl font-bold">{plot.code}</span>
                        </div>
                        <div>
                          <h3 className="text-[var(--text-primary)] text-lg font-semibold">{plot.name}</h3>
                          <p className="text-[var(--text-secondary)] text-sm">
                            {plot.owner ? `เจ้าของ: ${plot.owner}` : 'แปลงสวนทุเรียน'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)] text-sm">จำนวนต้น</span>
                        <span className="text-[var(--text-primary)] font-semibold">{plot.treeCount} ต้น</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)] text-sm">จำนวนโซน</span>
                        <span className="text-[var(--text-primary)] font-semibold">{plot.sectionCount} โซน</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-secondary)] text-sm">ระยะห่างโซน</span>
                        <span className="text-[var(--text-primary)] font-semibold">
                          {plot.sectionSpacing === 'FOUR_BY_FOUR' ? '4×4 เมตร' : '10×10 เมตร'}
                        </span>
                      </div>
                    </div>

                    {/* Example tree codes */}
                    <div className="mb-4">
                      <p className="text-[var(--text-secondary)] text-xs mb-2">ตัวอย่างรหัสต้น:</p>
                      <div className="flex flex-wrap gap-1">
                        {[1, 2, 3, 4, 5].map(num => (
                          <span key={num} className="inline-block bg-[var(--secondary-color)] text-[var(--primary-color)] text-xs px-2 py-1 rounded">
                            {plot.code}{num.toString().padStart(2, '0')}
                          </span>
                        ))}
                        {plot.sectionCount > 5 && (
                          <span className="text-[var(--text-secondary)] text-xs px-2 py-1">
                            ... {plot.code}{plot.sectionCount.toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={`/plots/${plot.code.toLowerCase()}`}>
                      <button className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200">
                        ดูรายละเอียดแปลง {plot.code}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Tree Structure Info */}
            <section className="p-4">
              <h2 className="text-[var(--text-primary)] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-4">Tree Identification System</h2>
              <div className="rounded-xl p-6 border border-[var(--border-color)] bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">ระบบรหัสต้นไม้</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded flex items-center justify-center text-sm font-bold">A</span>
                        <span className="text-[var(--text-secondary)]">แปลง A: A1, A2, A3, ... A60</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded flex items-center justify-center text-sm font-bold">B</span>
                        <span className="text-[var(--text-secondary)]">แปลง B: B1, B2, B3, ... B45</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded flex items-center justify-center text-sm font-bold">C</span>
                        <span className="text-[var(--text-secondary)]">แปลง C: C1, C2, C3, ... C35</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-3">ข้อมูลที่เก็บ</h3>
                    <ul className="space-y-1 text-[var(--text-secondary)] text-sm">
                      <li>• ข้อมูลแปลง: ขนาด, ประเภทดิน, รายละเอียด</li>
                      <li>• ข้อมูลต้น: พันธุ์, วันปลูก, สถานะ, ขนาด</li>
                      <li>• บันทึกการดูแล: ใส่ปุ่ย, ตรวจสุขภาพ, รูปภาพ</li>
                      <li>• ผลผลิต: จำนวนผล, น้ำหนัก, คุณภาพ</li>
                      <li>• ค่าใช้จ่าย: แยกตามแปลงและกิจกรรม</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}