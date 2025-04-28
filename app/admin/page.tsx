// app/admin/page.tsx — Admin panel (fully regenerated)
"use client";

import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

const Section = ({
  title,
  items,
  type,
  input,
  setInput,
  addItem,
  removeItem,
}: any) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="flex gap-2 mb-3">
        <input
          className="border px-3 py-1 rounded w-full"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={() => addItem(type, input, () => setInput(""))}
          className="bg-green-600 text-white px-4 py-1 rounded"
        >
          เพิ่ม
        </button>
      </div>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item: any) => (
          <li key={item.id} className="flex justify-between items-center">
            {item.name}
            <button
              onClick={() => removeItem(type, item.id)}
              className="text-red-500 text-sm"
            >
              ลบ
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function AdminPage() {
  const [varieties, setVarieties] = useState<any[]>([]);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesCost, setActivitiesCost] = useState<any[]>([]);

  const [newVariety, setNewVariety] = useState("");
  const [newFertilizer, setNewFertilizer] = useState("");
  const [newPesticide, setNewPesticide] = useState("");
  const [newDisease, setNewDisease] = useState("");

  const [newActivity, setNewActivity] = useState("");
  const [newActivityCost, setNewActivityCost] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [v, f, p, d, a, ac] = await Promise.all([
      supabase.from("varieties").select("*").order("name"),
      supabase.from("fertilizers").select("*").order("name"),
      supabase.from("pesticides").select("*").order("name"),
      supabase.from("plant_diseases").select("*").order("name"),
      supabase.from("activities").select("*").order("name"),
      supabase.from("activities_cost").select("*").order("name"),
    ]);
    setVarieties(v.data || []);
    setFertilizers(f.data || []);
    setPesticides(p.data || []);
    setDiseases(d.data || []);
    setActivities(a.data || []);
    setActivitiesCost(ac.data || []);
  }

  async function addItem(type: string, value: string, reset: () => void) {
    if (!value) return;

    // ตรวจสอบชื่อซ้ำก่อน insert
    const existing = await supabase
      .from(type)
      .select("name")
      .eq("name", value)
      .maybeSingle();
    if (existing.data) {
      toast.error("🚫 รายการนี้มีอยู่แล้ว");
      return;
    }

    const { data, error } = await supabase
      .from(type)
      .insert({ name: value })
      .select();
    if (!error && data) {
      reset();
      if (type === "varieties") setVarieties((prev) => [...prev, ...data]);
      if (type === "fertilizers") setFertilizers((prev) => [...prev, ...data]);
      if (type === "pesticides") setPesticides((prev) => [...prev, ...data]);
      if (type === "plant_diseases") setDiseases((prev) => [...prev, ...data]);
      if (type === "activities") setActivities((prev) => [...prev, ...data]);
      if (type === "activities_cost")
        setActivitiesCost((prev) => [...prev, ...data]);
    }
  }

  async function removeItem(type: string, id: string) {
    await supabase.from(type).delete().eq("id", id);
    fetchAll();
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-2xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🛠️ หน้าจัดการข้อมูล (Admin)</h1>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
          >
            🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
          </a>
        </div>

        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🌱 สายพันธุ์ทุเรียน"
          items={varieties}
          type="varieties"
          input={newVariety}
          setInput={setNewVariety}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="💊 ปุ๋ย"
          items={fertilizers}
          type="fertilizers"
          input={newFertilizer}
          setInput={setNewFertilizer}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🦟 ยาฆ่าแมลง"
          items={pesticides}
          type="pesticides"
          input={newPesticide}
          setInput={setNewPesticide}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="🍂 โรคพืช"
          items={diseases}
          type="plant_diseases"
          input={newDisease}
          setInput={setNewDisease}
        />
        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="⭐️ กิจกรรมของสวน"
          items={activities}
          type="activities"
          input={newActivity}
          setInput={setNewActivity}
        />

        <Section
          addItem={addItem}
          removeItem={removeItem}
          title="💼 กิจกรรมค่าใช้จ่าย"
          items={activitiesCost}
          type="activities_cost"
          input={newActivityCost}
          setInput={setNewActivityCost}
        />
      </main>
    </>
  );
}
