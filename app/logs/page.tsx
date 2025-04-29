// app/logs/page.tsx — Logs List with robust client-side tree lookup
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

import SingleLogSection, { SingleLog } from "../../components/SingleLogSection";
import BatchLogSection, { BatchLog } from "../../components/BatchLogSection";
import CostLogSection, { CostLog } from "../../components/CostLogSection";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const PAGE_SIZE = 5;

export default function LogsPage() {
  // Single logs state
  const [singleLogs, setSingleLogs] = useState<SingleLog[]>([]);
  const [singlePage, setSinglePage] = useState(1);
  const [singleTotal, setSingleTotal] = useState(0);
  // Batch logs state
  const [batchLogs, setBatchLogs] = useState<BatchLog[]>([]);
  const [batchPage, setBatchPage] = useState(1);
  const [batchTotal, setBatchTotal] = useState(0);
  // Cost logs state
  const [costLogs, setCostLogs] = useState<CostLog[]>([]);
  const [costPage, setCostPage] = useState(1);
  const [costTotal, setCostTotal] = useState(0);

  useEffect(() => {
    fetchSingleLogs();
  }, [singlePage]);
  useEffect(() => {
    fetchBatchLogs();
  }, [batchPage]);
  useEffect(() => {
    fetchCostLogs();
  }, [costPage]);

  // 1) Fetch single-tree logs and then merge tree info client-side
  async function fetchSingleLogs() {
    const from = (singlePage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // a) Pull this page of logs (no join)
    const {
      data: logs,
      count,
      error,
    } = await supabase
      .from("tree_logs")
      .select(
        "id, tree_id, log_date, notes, activity_type, health_status, fertilizer_type, image_path",
        { count: "exact" }
      )
      .is("batch_id", null)
      .order("log_date", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("fetchSingleLogs error", error);
      return;
    }
    if (!logs) return;
    if (count !== null) setSingleTotal(count);

    // b) Fetch ALL trees once (table is small)
    const { data: trees } = await supabase
      .from("trees")
      .select("id, location_id, tree_number, variety");

    // c) Build a lookup mapping by id, by tree_number, and by combo (location_id+tree_number)
    const treeMap: Record<
      string,
      { location_id: string; tree_number: string; variety: string }
    > = {};
    trees?.forEach((t) => {
      const combo = `${t.location_id}${t.tree_number}`;
      treeMap[t.id] = {
        location_id: t.location_id,
        tree_number: t.tree_number,
        variety: t.variety,
      };
      treeMap[t.tree_number] = {
        location_id: t.location_id,
        tree_number: t.tree_number,
        variety: t.variety,
      };
      treeMap[combo] = {
        location_id: t.location_id,
        tree_number: t.tree_number,
        variety: t.variety,
      };
    });

    // d) Merge tree info into each log
    const formatted: SingleLog[] = logs.map((l) => {
      const info = treeMap[l.tree_id] || {
        location_id: "–",
        tree_number: "–",
        variety: "–",
      };
      return {
        id: l.id,
        tree_id: l.tree_id,
        log_date: l.log_date,
        notes: l.notes,
        activity_type: l.activity_type,
        health_status: l.health_status,
        fertilizer_type: l.fertilizer_type,
        image_path: l.image_path,
        tree: info,
      };
    });

    setSingleLogs(formatted);
  }

  // 2) Fetch batch-of-plot logs (flatten activities array)
  async function fetchBatchLogs() {
    const from = (batchPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("batch_logs")
      .select("id, plot_id, log_date, notes, activities(name)", {
        count: "exact",
      })
      .order("log_date", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("fetchBatchLogs error", error);
      return;
    }
    if (!data) return;
    if (count !== null) setBatchTotal(count);

    const formatted: BatchLog[] = data.map((b: any) => ({
      id: b.id,
      plot_id: b.plot_id,
      log_date: b.log_date,
      notes: b.notes,
      activities:
        Array.isArray(b.activities) && b.activities.length > 0
          ? { name: b.activities[0].name }
          : undefined,
    }));

    setBatchLogs(formatted);
  }

  // 3) Fetch cost logs
  async function fetchCostLogs() {
    const from = (costPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await supabase
      .from("tree_costs")
      .select("id, cost_date, activity_type, target, amount, notes", {
        count: "exact",
      })
      .order("cost_date", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("fetchCostLogs error", error);
      return;
    }
    if (!data) return;
    if (count !== null) setCostTotal(count);
    setCostLogs(data as CostLog[]);
  }

  // Compute total pages
  const totalSinglePages = Math.ceil(singleTotal / PAGE_SIZE);
  const totalBatchPages = Math.ceil(batchTotal / PAGE_SIZE);
  const totalCostPages = Math.ceil(costTotal / PAGE_SIZE);

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold">📝 รายการบันทึกข้อมูล</h1>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🏠 หน้าหลัก
          </Link>
          <Link
            href="/logs/add-single"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-all"
          >
            🌳 เพิ่ม Log รายต้น
          </Link>
          <Link
            href="/logs/add-batch"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl shadow hover:bg-yellow-700 transition-all"
          >
            🌾 เพิ่ม Log ทั้งแปลง
          </Link>
          <Link
            href="/logs/cost"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl shadow hover:bg-purple-700 transition-all"
          >
            💰 เพิ่ม Log ค่าใช้จ่าย
          </Link>
        </div>
      </div>

      {/* Sections */}
      <SingleLogSection
        logs={singleLogs}
        page={singlePage}
        totalPages={totalSinglePages}
        onPageChange={setSinglePage}
      />
      <BatchLogSection
        logs={batchLogs}
        page={batchPage}
        totalPages={totalBatchPages}
        onPageChange={setBatchPage}
      />
      <CostLogSection
        logs={costLogs}
        page={costPage}
        totalPages={totalCostPages}
        onPageChange={setCostPage}
      />
    </main>
  );
}
