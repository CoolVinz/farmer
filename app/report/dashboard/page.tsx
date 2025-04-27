// app/report/dashboard/page.tsx — Dashboard with Bar Chart and Line Chart
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function DashboardPage() {
  const [costs, setCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchCosts();
  }, []);

  async function fetchCosts() {
    const { data } = await supabase.from("tree_costs").select("*");
    setCosts(data || []);
    setLoading(false);
  }

  const filteredCosts = costs.filter((cost) => {
    const costDate = new Date(cost.cost_date);
    const matchStart = startDate ? new Date(startDate) <= costDate : true;
    const matchEnd = endDate ? costDate <= new Date(endDate) : true;
    return matchStart && matchEnd;
  });

  const monthlyTotals: { [key: string]: number } = {};

  filteredCosts.forEach((cost) => {
    const date = new Date(cost.cost_date);
    const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    if (!monthlyTotals[monthYear]) monthlyTotals[monthYear] = 0;
    monthlyTotals[monthYear] += cost.amount || 0;
  });

  const labels = Object.keys(monthlyTotals).sort();
  const dataValues = labels.map((label) => monthlyTotals[label]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "ยอดค่าใช้จ่าย (บาท)",
        data: dataValues,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
    ],
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Dashboard รายงานต้นทุน</h1>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-bold mb-2">
          💰 ยอดรวมต้นทุนในช่วงวันที่เลือก
        </h2>
        <p className="text-xl text-amber-600 font-bold">
          {filteredCosts
            .reduce((sum, cost) => sum + (cost.amount || 0), 0)
            .toLocaleString()}{" "}
          บาท
        </p>
      </div>

      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : labels.length === 0 ? (
        <p>ไม่พบข้อมูลในช่วงเวลาที่เลือก</p>
      ) : (
        <div className="space-y-12">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Bar Chart</h2>
            <Bar data={chartData} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Line Chart</h2>
            <Line data={chartData} />
          </div>
        </div>
      )}
    </main>
  );
}
