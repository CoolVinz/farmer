// app/page.tsx or pages/index.tsx
"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="max-w-2xl mx-auto py-10 px-4 text-center">
      <h1 className="text-3xl font-bold mb-6">🌿 สวนวิสุทธิ์ศิริ</h1>
      <p className="mb-8 text-gray-600">เลือกเมนูที่คุณต้องการใช้งาน</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/log">
          <div className="bg-green-100 hover:bg-green-200 p-6 rounded-xl cursor-pointer">
            <h2 className="text-lg font-semibold">➕ บันทึกข้อมูลต้นไม้</h2>
            <p className="text-sm text-gray-600">เพิ่มข้อมูลปุ๋ย น้ำ รูปภาพ</p>
          </div>
        </Link>

        <Link href="/gallery">
          <div className="bg-yellow-100 hover:bg-yellow-200 p-6 rounded-xl cursor-pointer">
            <h2 className="text-lg font-semibold">🖼️ แกลเลอรีรูปภาพ</h2>
            <p className="text-sm text-gray-600">ดูภาพที่บันทึกไว้</p>
          </div>
        </Link>

        <Link href="/report">
          <div className="bg-blue-100 hover:bg-blue-200 p-6 rounded-xl cursor-pointer">
            <h2 className="text-lg font-semibold">📊 รายงานข้อมูล</h2>
            <p className="text-sm text-gray-600">ดูสรุปข้อมูลการดูแลต้นไม้</p>
          </div>
        </Link>

        <Link href="/admin">
          <div className="bg-gray-100 hover:bg-gray-200 p-6 rounded-xl cursor-pointer">
            <h2 className="text-lg font-semibold">⚙️ จัดการระบบ</h2>
            <p className="text-sm text-gray-600">เพิ่ม/แก้ไขปุ๋ย ยา ผู้ใช้</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
