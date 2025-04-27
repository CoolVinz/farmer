// app/trees/add/page.tsx — Add Tree Cost Page (Dropdown for plot selection)
"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function AddCostPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [mode, setMode] = useState<"single" | "all">("single");
  const [target, setTarget] = useState("");
  const [activityType, setActivityType] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [costDate, setCostDate] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("name");
    if (!error && data) setActivities(data);
  }

  async function handleSubmit() {
    if (!target || !activityType || !amount) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const { error } = await supabase.from("tree_costs").insert({
      cost_date: costDate
        ? new Date(costDate).toISOString()
        : new Date().toISOString(),
      activity_type: activityType,
      target,
      amount: parseFloat(amount),
      notes,
    });

    if (!error) {
      toast.success("บันทึกข้อมูลสำเร็จ");
      setTarget("");
      setActivityType("");
      setAmount("");
      setNotes("");
      setCostDate("");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">💰 บันทึกต้นทุน/ค่าใช้จ่าย</h1>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
          </a>
        </div>

        <div className="flex gap-4 mb-6">
          <label>
            <input
              type="radio"
              checked={mode === "single"}
              onChange={() => setMode("single")}
              className="mr-2"
            />
            บันทึกรายต้น
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "all"}
              onChange={() => setMode("all")}
              className="mr-2"
            />
            บันทึกทั้งแปลง
          </label>
        </div>

        <div className="mb-4">
          {mode === "all" ? (
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            >
              <option value="">เลือกแปลง</option>
              <option value="แปลง A">แปลง A</option>
              <option value="แปลง B">แปลง B</option>
              <option value="แปลง C">แปลง C</option>
            </select>
          ) : (
            <input
              type="text"
              placeholder="เช่น A1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            />
          )}
        </div>

        <div className="mb-4">
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          >
            <option value="">เลือกประเภทกิจกรรม</option>
            {activities.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <input
            type="date"
            value={costDate}
            onChange={(e) => setCostDate(e.target.value)}
            className="border rounded px-4 py-2 w-full mb-4"
          />
        </div>

        <div className="mb-4">
          <input
            type="number"
            placeholder="ยอดเงินรวม (บาท)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-4 py-2 w-full"
          />
        </div>

        <div className="mb-6">
          <textarea
            placeholder="หมายเหตุ (ถ้ามี)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded px-4 py-2 w-full"
            rows={3}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded w-full hover:bg-green-700"
        >
          บันทึกข้อมูล
        </button>
      </main>
    </>
  );
}
