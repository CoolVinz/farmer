// app/report/cost/page.tsx — Updated Cost Detail Report with Search + Date Filter
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// Using API routes instead of direct database access

export default function CostReportPage() {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchCosts();
  }, []);

  async function fetchCosts() {
    try {
      const response = await fetch('/api/logs/cost');
      if (!response.ok) {
        throw new Error('Failed to fetch costs');
      }
      const { logs } = await response.json();
      setCosts(logs || []);
    } catch (error) {
      console.error('Error fetching costs:', error);
      setCosts([]);
    }
    setLoading(false);
  }

  const filteredCosts = costs.filter((cost) => {
    const matchesSearch =
      cost.activity_type.toLowerCase().includes(search.toLowerCase()) ||
      (cost.notes && cost.notes.toLowerCase().includes(search.toLowerCase()));

    const costDate = new Date(cost.cost_date);
    const matchStart = startDate ? new Date(startDate) <= costDate : true;
    const matchEnd = endDate ? costDate <= new Date(endDate) : true;

    return matchesSearch && matchStart && matchEnd;
  });

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💰 รายละเอียดต้นทุนทั้งหมด</h1>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="ค้นหากิจกรรม หรือ หมายเหตุ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />
      </div>

      {loading ? (
        <p className="text-base">⏳ กำลังโหลดข้อมูล...</p>
      ) : filteredCosts.length === 0 ? (
        <p className="text-base">ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCosts.map((cost) => (
            <div
              key={cost.id}
              className="border p-4 rounded-xl bg-white shadow hover:shadow-md transition-all"
            >
              <h2 className="text-lg font-semibold">{cost.activity_type}</h2>
              <p className="text-sm text-gray-600">
                วันที่: {new Date(cost.cost_date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">เป้าหมาย: {cost.target}</p>
              <p className="text-sm text-gray-600">
                หมายเหตุ: {cost.notes || "-"}
              </p>
              <p className="text-lg font-bold text-amber-600 mt-2">
                ยอดเงิน: {cost.amount.toLocaleString()} บาท
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
