// app/logs/cost/page.tsx — Form: Add Cost Log (both-plot only, using correct columns)
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function AddCostLogPage() {
  // ดึงรายการกิจกรรมจากตาราง activities_cost
  const [activitiesCost, setActivitiesCost] = useState<
    { id: string; name: string }[]
  >([]);
  // สถานะฟอร์ม
  const [activityType, setActivityType] = useState(""); // จะเก็บชื่อกิจกรรมตรงๆ
  const [target, setTarget] = useState("ทุกแปลง");
  const [amount, setAmount] = useState<number | "">("");
  const [logDate, setLogDate] = useState("");
  const [notes, setNotes] = useState("");

  // ตัวเลือกแปลงคงที่: A, B, C และ ทุกแปลง
  const plotOptions = ["ทุกแปลง", "แปลง A", "แปลง B", "แปลง C"];

  useEffect(() => {
    fetchActivitiesCost();
  }, []);

  async function fetchActivitiesCost() {
    const { data, error } = await supabase
      .from("activities_cost")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("fetchActivitiesCost error:", error.message);
      return;
    }
    setActivitiesCost(data ?? []);
  }

  async function handleSubmit() {
    const date = logDate || new Date().toISOString().slice(0, 10);
    if (!activityType || !target || !amount) {
      toast.error("กรุณาเลือกกิจกรรม, แปลง และกรอกจำนวนเงินให้ครบ");
      return;
    }

    // insert เข้าตาราง tree_costs ด้วยคอลัมน์ที่แท้จริง
    const { error } = await supabase.from("tree_costs").insert({
      cost_date: date,
      activity_type: activityType,
      target: target,
      amount: amount,
      notes: notes || null,
    });

    if (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
    } else {
      toast.success("บันทึกค่าใช้จ่ายเรียบร้อยแล้ว");
      // รีเซ็ตฟอร์ม
      setActivityType("");
      setTarget("ทุกแปลง");
      setAmount("");
      setLogDate("");
      setNotes("");
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">💰 บันทึกค่าใช้จ่าย (ทั้งแปลง)</h1>
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🔙 กลับหน้า Log
          </Link>
        </div>

        <div className="space-y-4">
          {/* กิจกรรม */}
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกกิจกรรม</option>
            {activitiesCost.map((ac) => (
              <option key={ac.id} value={ac.name}>
                {ac.name}
              </option>
            ))}
          </select>

          {/* แปลง */}
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            {plotOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* จำนวนเงิน */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="จำนวนเงิน (บาท)"
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          {/* วันที่ */}
          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          {/* หมายเหตุ */}
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="หมายเหตุ (optional)"
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          {/* ปุ่มบันทึก */}
          <button
            onClick={handleSubmit}
            className="w-full bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 shadow"
          >
            ✅ บันทึกค่าใช้จ่าย
          </button>
        </div>
      </main>
    </>
  );
}
