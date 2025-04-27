// app/logs/page.tsx — Log Main Page (Choose single or batch)
"use client";

import Link from "next/link";

export default function LogsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📝 เลือกวิธีการบันทึกข้อมูล</h1>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Link
          href="/logs/add-single"
          className="inline-flex items-center gap-2 px-6 py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl shadow hover:bg-blue-600 transition-all"
        >
          🌳 บันทึกรายต้น
        </Link>

        <Link
          href="/logs/add-batch"
          className="inline-flex items-center gap-2 px-6 py-4 bg-green-500 text-white text-lg font-semibold rounded-xl shadow hover:bg-green-600 transition-all"
        >
          🌾 บันทึกทั้งแปลง
        </Link>
      </div>
    </main>
  );
}
