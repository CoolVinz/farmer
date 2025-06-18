'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FarmlySidebar } from "@/components/FarmlySidebar";
import { FarmlyTable, StatusBadge, ActionButton } from "@/components/farmly/FarmlyTable";
import { FarmlyButton } from "@/components/farmly/FarmlyButton";
import '../../styles/farmly.css';

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

  // Format data for Farmly tables
  const singleLogColumns = [
    { key: 'tree_id', header: 'รหัสต้น' },
    { key: 'log_date', header: 'วันที่บันทึก', render: (date: string) => new Date(date).toLocaleDateString('th-TH') },
    { key: 'activity_type', header: 'กิจกรรม' },
    { 
      key: 'health_status', 
      header: 'สุขภาพ',
      render: (status: string) => {
        if (!status) return '–';
        const variant = status === 'healthy' ? 'healthy' : status === 'sick' ? 'sick' : 'critical';
        const statusText = status === 'healthy' ? 'แข็งแรง' : status === 'sick' ? 'ป่วย' : 'วิกฤต';
        return <StatusBadge status={statusText} variant={variant} />;
      }
    },
    { key: 'notes', header: 'หมายเหตุ', render: (notes: string) => notes?.substring(0, 50) + (notes?.length > 50 ? '...' : '') || '–' },
    { 
      key: 'actions', 
      header: 'จัดการ',
      render: (_: any, row: SingleLog) => (
        <ActionButton href={`/logs/single/${row.id}`}>
          ดูรายละเอียด
        </ActionButton>
      )
    }
  ];

  const batchLogColumns = [
    { key: 'plot_id', header: 'รหัสแปลง' },
    { key: 'log_date', header: 'วันที่บันทึก', render: (date: string) => new Date(date).toLocaleDateString('th-TH') },
    { key: 'activities', header: 'กิจกรรม', render: (activities: any) => activities?.name || '–' },
    { key: 'notes', header: 'หมายเหตุ', render: (notes: string) => notes?.substring(0, 50) + (notes?.length > 50 ? '...' : '') || '–' },
    { 
      key: 'actions', 
      header: 'จัดการ',
      render: (_: any, row: BatchLog) => (
        <ActionButton href={`/logs/batch/${row.id}`}>
          ดูรายละเอียด
        </ActionButton>
      )
    }
  ];

  const costLogColumns = [
    { key: 'cost_date', header: 'วันที่', render: (date: string) => new Date(date).toLocaleDateString('th-TH') },
    { key: 'activity_type', header: 'ประเภทกิจกรรม' },
    { key: 'target', header: 'เป้าหมาย' },
    { key: 'amount', header: 'จำนวนเงิน', render: (amount: number) => `${amount?.toLocaleString()} บาท` },
    { key: 'notes', header: 'หมายเหตุ', render: (notes: string) => notes?.substring(0, 30) + (notes?.length > 30 ? '...' : '') || '–' },
    { 
      key: 'actions', 
      header: 'จัดการ',
      render: (_: any, row: CostLog) => (
        <ActionButton href={`/logs/cost/${row.id}`}>
          ดูรายละเอียด
        </ActionButton>
      )
    }
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden">
      <div className="flex h-full grow">
        <FarmlySidebar />
        
        <main className="ml-72 flex-1 bg-[var(--accent-color)] p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="farmly-page-title">บันทึกการดูแลสวนทุเรียน</h2>
            <FarmlyButton 
              variant="primary" 
              href="/logs/add-single"
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                </svg>
              }
            >
              เพิ่มบันทึกใหม่
            </FarmlyButton>
          </div>

          <section className="mb-10">
            <h3 className="farmly-section-title">บันทึกการดูแลรายต้น</h3>
            {singleLogs.length > 0 ? (
              <FarmlyTable columns={singleLogColumns} data={singleLogs} />
            ) : (
              <div className="farmly-card p-8 text-center">
                <div className="text-4xl mb-4">🌳</div>
                <p className="text-[var(--text-secondary)]">ยังไม่มีบันทึกการดูแลรายต้น</p>
                <FarmlyButton href="/logs/add-single" className="mt-4">
                  เพิ่มบันทึกรายต้น
                </FarmlyButton>
              </div>
            )}
          </section>

          <section className="mb-10">
            <h3 className="farmly-section-title">บันทึกการดูแลแปลง</h3>
            {batchLogs.length > 0 ? (
              <FarmlyTable columns={batchLogColumns} data={batchLogs} />
            ) : (
              <div className="farmly-card p-8 text-center">
                <div className="text-4xl mb-4">🌾</div>
                <p className="text-[var(--text-secondary)]">ยังไม่มีบันทึกการดูแลแปลง</p>
                <FarmlyButton href="/logs/add-batch" className="mt-4">
                  เพิ่มบันทึกแปลง
                </FarmlyButton>
              </div>
            )}
          </section>

          <section>
            <h3 className="farmly-section-title">บันทึกค่าใช้จ่าย</h3>
            {costLogs.length > 0 ? (
              <FarmlyTable columns={costLogColumns} data={costLogs} />
            ) : (
              <div className="farmly-card p-8 text-center">
                <div className="text-4xl mb-4">💰</div>
                <p className="text-[var(--text-secondary)]">ยังไม่มีบันทึกค่าใช้จ่าย</p>
                <FarmlyButton href="/logs/cost" className="mt-4">
                  เพิ่มบันทึกค่าใช้จ่าย
                </FarmlyButton>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}