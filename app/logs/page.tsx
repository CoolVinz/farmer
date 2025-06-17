'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import SingleLogSection, { SingleLog } from "../../components/SingleLogSection";
import BatchLogSection, { BatchLog } from "../../components/BatchLogSection";
import CostLogSection, { CostLog } from "../../components/CostLogSection";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              📝 บันทึกข้อมูลการดูแลสวน
            </h1>
            <p className="text-xl text-gray-600 mb-8">จัดการและติดตามข้อมูลการดูแลต้นทุเรียนอย่างเป็นระบบ</p>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌳</div>
                  <div className="text-2xl font-bold text-emerald-600">{singleTotal}</div>
                  <div className="text-sm text-gray-600">บันทึกรายต้น</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="text-2xl font-bold text-teal-600">{batchTotal}</div>
                  <div className="text-sm text-gray-600">บันทึกแปลง</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-cyan-600">{costTotal}</div>
                  <div className="text-sm text-gray-600">บันทึกค่าใช้จ่าย</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-indigo-600">{singleTotal + batchTotal + costTotal}</div>
                  <div className="text-sm text-gray-600">รวมทั้งหมด</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 h-16 text-lg">
                <Link href="/logs/add-single">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌳</div>
                    <div>บันทึกรายต้น</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild className="bg-teal-600 hover:bg-teal-700 h-16 text-lg">
                <Link href="/logs/add-batch">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌾</div>
                    <div>บันทึกแปลง</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild className="bg-cyan-600 hover:bg-cyan-700 h-16 text-lg">
                <Link href="/logs/cost">
                  <div className="text-center">
                    <div className="text-2xl mb-1">💰</div>
                    <div>บันทึกค่าใช้จ่าย</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur h-16 text-lg border-2">
                <Link href="/gallery">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🖼️</div>
                    <div>ดูแกลเลอรี</div>
                  </div>
                </Link>
              </Button>
            </div>
            
            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/">
                  🏠 หน้าหลัก
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/report">
                  📊 ดูรายงาน
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/80 backdrop-blur">
                <Link href="/admin">
                  ⚙️ จัดการข้อมูล
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Log Sections */}
        <div className="space-y-12">
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
        </div>
        
        {/* Empty State */}
        {singleTotal === 0 && batchTotal === 0 && costTotal === 0 && (
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-200">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">เริ่มต้นบันทึกข้อมูลสวนของคุณ</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                ยังไม่มีข้อมูลในระบบ เริ่มต้นด้วยการเพิ่มข้อมูลต้นไม้หรือบันทึกกิจกรรมการดูแลสวน
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/admin">
                    ⚙️ ตั้งค่าข้อมูลพื้นฐาน
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/logs/add-single">
                    🌳 เพิ่มข้อมูลต้นไม้
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
