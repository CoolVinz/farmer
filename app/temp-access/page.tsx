'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Tree {
  id: string
  location_id: string
  variety: string
  planted_date: string
  status: string
  tree_number: number
}

interface TreeLog {
  id: string
  tree_id: string
  log_date: string
  activity_type: string
  notes: string
}

export default function TempAccessPage() {
  const [trees, setTrees] = useState<Tree[]>([])
  const [treeLogs, setTreeLogs] = useState<TreeLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch trees
      const { data: treesData, error: treesError } = await supabase
        .from('trees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (treesError) {
        console.error('Trees error:', treesError)
      } else {
        setTrees(treesData || [])
      }

      // Fetch tree logs
      const { data: logsData, error: logsError } = await supabase
        .from('tree_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (logsError) {
        console.error('Logs error:', logsError)
      } else {
        setTreeLogs(logsData || [])
      }

    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">🌿 ข้อมูลสวนวิสุทธิ์ศิริ</h1>
        <p className="text-gray-600 mb-4">
          นี่คือหน้าเข้าถึงข้อมูลชั่วคราว - คุณมีข้อมูลทั้งหมด {trees.length} ต้น
        </p>
        
        <div className="flex gap-4 mb-6">
          <Link href="/auth" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            🔐 เข้าสู่ระบบปกติ
          </Link>
          <button 
            onClick={() => window.location.href = '/admin'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ⚙️ ไปหน้า Admin (ต้องล็อกอิน)
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trees */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🌳 ต้นไม้ (แสดง 10 รายการล่าสุด)</h2>
          <div className="space-y-3">
            {trees.map((tree) => (
              <div key={tree.id} className="border-l-4 border-green-500 pl-4 py-2">
                <div className="font-semibold">
                  {tree.variety} - แปลง {tree.location_id} หมายเลข {tree.tree_number}
                </div>
                <div className="text-sm text-gray-600">
                  ปลูก: {tree.planted_date} | สถานะ: {tree.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tree Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">📝 บันทึกกิจกรรม</h2>
          <div className="space-y-3">
            {treeLogs.map((log) => (
              <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-semibold">{log.activity_type}</div>
                <div className="text-sm text-gray-600">
                  วันที่: {log.log_date}
                </div>
                {log.notes && (
                  <div className="text-sm text-gray-500">หมายเหตุ: {log.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">📊 สรุปข้อมูลทั้งหมด:</h3>
        <p>• ต้นไม้: 61 ต้น</p>
        <p>• บันทึกกิจกรรม: 1 รายการ</p>
        <p>• กิจกรรมแปลง: 3 รายการ</p>
        <p>• บันทึกค่าใช้จ่าย: 3 รายการ</p>
        <p>• พันธุ์ทุเรียน: 7 พันธุ์</p>
        <p>• ประเภทปุ๋ย: 4 ประเภท</p>
      </div>
    </div>
  )
}