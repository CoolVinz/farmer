// app/logs/page.tsx — Logs List with Full Pagination, Real-time Filter, Page Counter
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";

const PAGE_SIZE = 8;

export default function LogsListPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filter]);

  async function fetchLogs() {
    let baseQuery = supabase.from("tree_logs").select("*", { count: "exact" });

    if (filter) {
      baseQuery = baseQuery.ilike("tree_id", `%${filter}%`);
    }

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count } = await baseQuery.range(from, to);

    if (data) setLogs(data);
    if (count !== null) setTotalLogs(count);
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= Math.ceil(totalLogs / PAGE_SIZE)) {
      setCurrentPage(newPage);
    }
  }

  const totalPages = Math.ceil(totalLogs / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📝 รายการบันทึกข้อมูลต้นไม้</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🏠 กลับหน้าหลัก
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="ค้นหาด้วย Tree ID..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-xl px-4 py-2 w-full max-w-xs shadow"
        />
        {filter && (
          <button
            onClick={() => {
              setFilter("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
          >
            ❌ ล้างค้นหา
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500">ไม่มีข้อมูลบันทึกต้นไม้</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">📅 วันที่:</span>{" "}
                    {log.log_date}
                  </p>
                  <p>
                    <span className="font-semibold">🌳 ต้นไม้:</span>{" "}
                    {log.tree_id}
                  </p>
                  {log.activity_type && (
                    <p>
                      <span className="font-semibold">⚡ กิจกรรม:</span>{" "}
                      {log.activity_type}
                    </p>
                  )}
                  {log.health_status && (
                    <p>
                      <span className="font-semibold">🌿 สุขภาพ:</span>{" "}
                      {log.health_status}
                    </p>
                  )}
                  {log.fertilizer_type && (
                    <p>
                      <span className="font-semibold">💊 ปุ๋ย:</span>{" "}
                      {log.fertilizer_type}
                    </p>
                  )}
                  {log.notes && (
                    <p>
                      <span className="font-semibold">📝 หมายเหตุ:</span>{" "}
                      {log.notes}
                    </p>
                  )}
                </div>
                {log.image_path && (
                  <div className="mt-4 sm:mt-0">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${log.image_path}`}
                      alt="Tree Log Image"
                      width={160}
                      height={120}
                      className="rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalLogs > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex justify-center items-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              ◀️ ก่อนหน้า
            </button>

            <span className="font-semibold">
              หน้าที่ {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              ถัดไป ▶️
            </button>
          </div>
          <p className="text-gray-500 text-sm">ทั้งหมด {totalLogs} รายการ</p>
        </div>
      )}
      </main>
    </div>
  );
}
