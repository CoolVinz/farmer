// app/logs/cost/page.tsx — Form: Add Cost Log
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
  const [activities, setActivities] = useState<{ id: string; name: string }[]>(
    []
  );
  const [targets, setTargets] = useState<{ id: string; name: string }[]>([]);
  const [activityType, setActivityType] = useState("");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [logDate, setLogDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchActivities();
    fetchTargets();
  }, []);

  async function fetchActivities() {
    const { data } = await supabase
      .from("activities")
      .select("id,name")
      .order("name", { ascending: true });
    if (data) setActivities(data);
  }

  async function fetchTargets() {
    const { data } = await supabase
      .from("activities_cost")
      .select("id,name")
      .order("name", { ascending: true });
    if (data) setTargets(data);
  }

  async function handleSubmit() {
    const date = logDate || new Date().toISOString().split("T")[0];
    if (!activityType || !target || !amount) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    const { error } = await supabase.from("tree_costs").insert({
      cost_date: date,
      activity_type: activityType,
      target,
      amount,
      notes: notes || null,
    });
    if (!error) {
      toast.success("บันทึกค่าใช้จ่ายสำเร็จ");
      setActivityType("");
      setTarget("");
      setAmount("");
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
          <h1 className="text-2xl font-bold">💰 บันทึกค่าใช้จ่าย</h1>
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🔙 กลับหน้ารายการ Log
          </Link>
        </div>

        <div className="space-y-4">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกประเภทกิจกรรม</option>
            {activities.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกเป้าหมาย</option>
            {targets.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="จำนวนเงิน"
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          <input
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          <textarea
            placeholder="หมายเหตุ (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
            rows={3}
          />

          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl w-full hover:bg-purple-700 shadow"
          >
            ✅ บันทึกค่าใช้จ่าย
          </button>
        </div>
      </main>
    </>
  );
}
