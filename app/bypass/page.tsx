'use client'

import Link from 'next/link'

export default function BypassPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">🌿 สวนวิสุทธิ์ศิริ - เข้าถึงโดยตรง</h1>
      <p className="mb-8 text-gray-600">เข้าถึงข้อมูลโดยไม่ต้องล็อกอิน (ชั่วคราว)</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a href="/temp-access" className="bg-green-100 hover:bg-green-200 p-6 rounded-xl cursor-pointer block">
          <h2 className="text-lg font-semibold">📊 ดูข้อมูลสรุป</h2>
          <p className="text-sm text-gray-600">ดูข้อมูลต้นไม้และกิจกรรม</p>
        </a>

        <a href="/logs/all" className="bg-blue-100 hover:bg-blue-200 p-6 rounded-xl cursor-pointer block">
          <h2 className="text-lg font-semibold">📝 บันทึกทั้งหมด</h2>
          <p className="text-sm text-gray-600">ดูบันทึกกิจกรรมทั้งหมด</p>
        </a>

        <a href="/gallery" className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-xl cursor-pointer block">
          <h2 className="text-lg font-semibold">🖼️ แกลเลอรี</h2>
          <p className="text-sm text-gray-600">ดูรูปภาพที่บันทึกไว้</p>
        </a>

        <a href="/report" className="bg-purple-100 hover:bg-purple-200 p-6 rounded-xl cursor-pointer block">
          <h2 className="text-lg font-semibold">📈 รายงาน</h2>
          <p className="text-sm text-gray-600">ดูรายงานสรุปข้อมูล</p>
        </a>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">💡 หมายเหตุ:</h3>
        <p className="text-sm">
          หน้านี้สร้างขึ้นเพื่อให้คุณเข้าถึงข้อมูลได้ชั่วคราว<br/>
          ข้อมูลของคุณยังอยู่ครบถ้วนในฐานข้อมูล Supabase
        </p>
        <Link href="/auth" className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
          เข้าสู่ระบบปกติ
        </Link>
      </div>
    </div>
  )
}