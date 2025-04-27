// app/logs/add-single/page.tsx — Add Single Tree Log
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function AddSingleLogPage() {
  const [trees, setTrees] = useState<any[]>([]);
  const [treeId, setTreeId] = useState("");
  const [notes, setNotes] = useState("");
  const [logDate, setLogDate] = useState("");

  useEffect(() => {
    fetchTrees();
  }, []);

  async function fetchTrees() {
    const { data } = await supabase
      .from("trees")
      .select("id, location_id, tree_number");

    if (data) {
      const sorted = data.sort((a, b) => {
        const aLocation = a.location_id.match(/[A-Z]+/g)?.[0] || "";
        const bLocation = b.location_id.match(/[A-Z]+/g)?.[0] || "";
        const aNum = parseInt(a.location_id.replace(/\D/g, "")) || 0;
        const bNum = parseInt(b.location_id.replace(/\D/g, "")) || 0;

        if (aLocation === bLocation) {
          return aNum - bNum;
        } else {
          return aLocation.localeCompare(bLocation);
        }
      });
      setTrees(sorted);
    }
  }

  async function handleSubmit() {
    if (!treeId || !logDate) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const { error } = await supabase.from("tree_logs").insert({
      tree_id: treeId,
      log_date: logDate,
      notes,
    });

    if (!error) {
      toast.success("บันทึกข้อมูลสำเร็จ");
      setTreeId("");
      setNotes("");
      setLogDate("");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🌳 บันทึกข้อมูลรายต้น</h1>
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🔙 กลับหน้าเลือกวิธีบันทึก
          </Link>
        </div>

        <div className="space-y-4">
          <select
            value={treeId}
            onChange={(e) => setTreeId(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="">เลือกต้นไม้</option>
            {trees.map((tree: any) => (
              <option key={tree.id} value={tree.id}>
                {tree.location_id} - {tree.tree_number}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          />

          <textarea
            placeholder="หมายเหตุ (ถ้ามี)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-4 py-2 w-full"
            rows={3}
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
          >
            บันทึกข้อมูล
          </button>
        </div>
      </main>
    </>
  );
}
