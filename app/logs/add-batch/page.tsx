// app/logs/add-batch/page.tsx — Add Batch Tree Logs with Activity Select
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

type Activity = { id: string; name: string };

export default function AddBatchLogPage() {
  const [plots] = useState<string[]>(["A", "B", "C"]); // หรือดึงจาก DB ก็ได้
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedPlot, setSelectedPlot] = useState("");
  const [activityType, setActivityType] = useState("");
  const [logDate, setLogDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const { data } = await supabase
      .from("activities")
      .select("id, name")
      .order("name", { ascending: true });
    if (data) setActivities(data);
  }

  async function handleSubmit() {
    if (!selectedPlot) {
      toast.error("กรุณาเลือกแปลง");
      return;
    }
    const date = logDate || new Date().toISOString().split("T")[0];

    // บันทึกแค่หนึ่งแถวใน batch_logs
    const { error } = await supabase.from("batch_logs").insert({
      plot_id: selectedPlot,
      log_date: date,
      activity_id: activityType || null,
      notes: notes || null,
    });

    if (!error) {
      toast.success(`บันทึกทั้งแปลง ${selectedPlot} เรียบร้อย`);
      setSelectedPlot("");
      setActivityType("");
      setLogDate("");
      setNotes("");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🌾 บันทึกทั้งแปลง</h1>
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🔙 กลับหน้ารายการ Log
          </Link>
        </div>

        <div className="space-y-4">
          {/* เลือกแปลง */}
          <select
            value={selectedPlot}
            onChange={(e) => setSelectedPlot(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกแปลง</option>
            {plots.map((p) => (
              <option key={p} value={p}>{`แปลง ${p}`}</option>
            ))}
          </select>

          {/* เลือกกิจกรรม */}
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกประเภทกิจกรรม (optional)</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* วันที่ */}
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          {/* หมายเหตุ */}
          <textarea
            placeholder="หมายเหตุ (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
            rows={3}
          />

          {/* ปุ่มบันทึก */}
          <button
            onClick={handleSubmit}
            className="bg-yellow-600 text-white px-6 py-2 rounded-xl w-full hover:bg-yellow-700 shadow"
          >
            ✅ บันทึกทั้งแปลง
          </button>
        </div>
      </main>
    </>
  );
}
