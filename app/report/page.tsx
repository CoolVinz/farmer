// app/report/page.tsx — Farm Summary Report Page
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

function CostSummary() {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCosts();
  }, []);

  async function fetchCosts() {
    const { data } = await supabase.from("tree_costs").select("*");
    setCosts(data || []);
    setLoading(false);
  }

  const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0);

  if (loading)
    return <p className="text-base">⏳ กำลังโหลดข้อมูลค่าใช้จ่าย...</p>;

  return (
    <div className="border p-4 rounded-xl bg-white">
      <h3 className="text-base font-semibold">💸 ค่าใช้จ่ายรวม (บาท)</h3>
      <p className="text-lg font-bold text-amber-600">
        {totalCost.toLocaleString()}
      </p>
    </div>
  );
}

export default function ReportPage() {
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrees();
  }, []);

  async function fetchTrees() {
    const { data } = await supabase.from("trees").select("*");
    setTrees(data || []);
    setLoading(false);
  }

  const total = trees.length;
  const alive = trees.filter((t) => t.status === "alive").length;
  const dead = trees.filter((t) => t.status === "dead").length;
  const totalFruits = trees.reduce((sum, t) => sum + (t.fruit_count || 0), 0);
  const fruiting = trees.filter((t) => (t.fruit_count || 0) > 0).length;
  const avgFruit = total > 0 ? (totalFruits / total).toFixed(2) : "0.00";

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">📊 รายงานภาพรวมสวนวิสุทธิ์ศิริ</h1>
        <div className="flex gap-2">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
          </a>
          <a
            href="/report/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-all"
          >
            📈 ดู Dashboard ต้นทุน
          </a>
        </div>
      </div>

      {loading ? (
        <p className="text-base">⏳ กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
          <div className="border p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-base font-semibold">🌳 จำนวนต้นทั้งหมด</h2>
            <p className="text-lg font-bold">{total}</p>
          </div>
          <div className="border p-4 rounded-xl bg-white">
            <h2 className="text-base font-semibold">🟢 มีชีวิต</h2>
            <p className="text-lg font-bold text-green-600">{alive}</p>
          </div>
          <div className="border p-4 rounded-xl bg-white">
            <h2 className="text-base font-semibold">⚰️ ตายแล้ว</h2>
            <p className="text-lg font-bold text-red-500">{dead}</p>
          </div>
          <div className="border p-4 rounded-xl bg-white">
            <h2 className="text-base font-semibold">🍈 จำนวนผลรวม</h2>
            <p className="text-lg font-bold">{totalFruits}</p>
          </div>
          <div className="border p-4 rounded-xl bg-white">
            <h2 className="text-base font-semibold">🌼 ต้นที่มีผล</h2>
            <p className="text-lg font-bold">{fruiting}</p>
          </div>
          <div className="border p-4 rounded-xl bg-white">
            <h2 className="text-base font-semibold">📦 ผลเฉลี่ยต่อต้น</h2>
            <p className="text-lg font-bold">{avgFruit}</p>
          </div>
        </div>
      )}

      {/* ค่าใช้จ่ายรวม */}
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">💰 สรุปต้นทุนทั้งหมด</h2>
          <a
            href="/report/cost"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition-all"
          >
            📋 ดูรายละเอียดต้นทุน
          </a>
        </div>
        <CostSummary />
      </section>
    </main>
  );
}
