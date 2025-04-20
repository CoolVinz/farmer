// app/admin/page.tsx — Admin panel with Home button
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function AdminPage() {
  const [varieties, setVarieties] = useState<any[]>([]);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [pesticides, setPesticides] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);

  const [newVariety, setNewVariety] = useState("");
  const [newFertilizer, setNewFertilizer] = useState("");
  const [newPesticide, setNewPesticide] = useState("");
  const [newDisease, setNewDisease] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [v, f, p, d] = await Promise.all([
      supabase.from("varieties").select("*").order("name"),
      supabase.from("fertilizers").select("*").order("name"),
      supabase.from("pesticides").select("*").order("name"),
      supabase.from("plant_diseases").select("*").order("name"),
    ]);
    setVarieties(v.data || []);
    setFertilizers(f.data || []);
    setPesticides(p.data || []);
    setDiseases(d.data || []);
  }

  async function addItem(type: string, value: string, reset: () => void) {
    if (!value) return;
    const { error } = await supabase.from(type).insert({ name: value });
    if (!error) {
      reset();
      fetchAll();
    }
  }

  async function removeItem(type: string, id: string) {
    await supabase.from(type).delete().eq("id", id);
    fetchAll();
  }

  const Section = ({ title, items, type, input, setInput }: any) => (
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

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛠️ หน้าจัดการข้อมูล (Admin)</h1>
        <Link href="/" className="text-blue-600 underline">
          🏠 Home
        </Link>
      </div>

      <Section
        title="🌱 สายพันธุ์ทุเรียน"
        items={varieties}
        type="varieties"
        input={newVariety}
        setInput={setNewVariety}
      />
      <Section
        title="💊 ปุ๋ย"
        items={fertilizers}
        type="fertilizers"
        input={newFertilizer}
        setInput={setNewFertilizer}
      />
      <Section
        title="🦟 ยาฆ่าแมลง"
        items={pesticides}
        type="pesticides"
        input={newPesticide}
        setInput={setNewPesticide}
      />
      <Section
        title="🍂 โรคพืช"
        items={diseases}
        type="plant_diseases"
        input={newDisease}
        setInput={setNewDisease}
      />
    </main>
  );
}
