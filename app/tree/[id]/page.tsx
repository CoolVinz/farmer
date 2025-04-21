// app/tree/[id]/page.tsx — with Tailwind v4 styling, Home button, and variety dropdown
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function TreeProfileByLocation() {
  const { id } = useParams();
  const [tree, setTree] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [varieties, setVarieties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof id === "string") {
      const locationId = (id as string).toUpperCase();
      fetchTree(locationId);
      fetchHistory(locationId);
      fetchVarieties();
    }
  }, [id]);

  async function fetchTree(locationId: string) {
    const { data } = await supabase
      .from("trees")
      .select("*")
      .eq("location_id", locationId)
      .order("planted_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    setTree(data);
    setLoading(false);
  }

  async function fetchHistory(locationId: string) {
    const { data } = await supabase
      .from("trees")
      .select("*")
      .eq("location_id", locationId)
      .order("tree_number", { ascending: true });

    setHistory(data || []);
  }

  async function fetchVarieties() {
    const { data } = await supabase
      .from("varieties")
      .select("*")
      .order("name", { ascending: true });

    setVarieties(data || []);
  }

  async function saveTree() {
    if (!tree?.id) return;
    const updatedTree = {
      ...tree,
      death_date:
        tree.status === "dead" && !tree.death_date
          ? new Date().toISOString().split("T")[0]
          : tree.status !== "dead"
          ? null
          : tree.death_date,
    };
    setSaving(true);
    const { error } = await supabase
      .from("trees")
      .update(updatedTree)
      .eq("id", tree.id);
    setSaving(false);
    if (error) alert("❌ เกิดข้อผิดพลาดในการบันทึก");
    else alert("✅ บันทึกข้อมูลต้นไม้แล้ว");
  }

  async function createNewTree() {
    if (tree?.status !== "dead") {
      return alert(
        '❌ สามารถปลูกต้นใหม่ได้เฉพาะเมื่อสถานะเป็น "ตายแล้ว" เท่านั้น'
      );
    }

    const locationId = tree.location_id;
    const { count } = await supabase
      .from("trees")
      .select("*", { count: "exact", head: true })
      .eq("location_id", locationId);

    const newTree = {
      location_id: locationId,
      variety: "",
      status: "alive",
      planted_date: new Date().toISOString().split("T")[0],
      tree_number: (count || 0) + 1,
    };

    const { error } = await supabase.from("trees").insert(newTree);
    if (error) return alert("❌ เกิดข้อผิดพลาดในการปลูกต้นใหม่");

    alert("✅ ปลูกต้นใหม่เรียบร้อยแล้ว");
    location.reload();
  }

  if (loading)
    return <p className="text-center mt-10 text-base">⏳ กำลังโหลดข้อมูล...</p>;
  if (!tree)
    return (
      <p className="text-center mt-10 text-base">
        ❌ ไม่พบข้อมูลต้นไม้ในจุด {(id as string).toUpperCase()}
      </p>
    );

  return (
    <main className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          🌳 โปรไฟล์ต้นไม้ {(id as string).toUpperCase()}
        </h1>
        <a href="/" className="text-blue-600 underline text-base">
          🏠 Home
        </a>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-base font-medium mb-1">สายพันธุ์</label>
          <select
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.variety || ""}
            onChange={(e) => setTree({ ...tree, variety: e.target.value })}
          >
            <option value="">-- เลือกสายพันธุ์ --</option>
            {varieties.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-medium mb-1">วันที่ปลูก</label>
          <input
            type="date"
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.planted_date?.split("T")[0] || ""}
            onChange={(e) => setTree({ ...tree, planted_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-base font-medium mb-1">สถานะ</label>
          <select
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.status || "alive"}
            onChange={(e) => setTree({ ...tree, status: e.target.value })}
          >
            <option value="alive">🌱 มีชีวิต</option>
            <option value="dead">🪦 ตายแล้ว</option>
          </select>
        </div>

        {tree.status === "dead" && (
          <div>
            <label className="block text-base font-medium mb-1">
              📅 วันที่ตาย
            </label>
            <input
              type="date"
              className="w-full border px-4 py-2 rounded-xl"
              value={tree.death_date || ""}
              onChange={(e) => setTree({ ...tree, death_date: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-base font-medium mb-1">
            ขนาดต้นไม้ (เมตร)
          </label>
          <input
            type="number"
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.tree_height || ""}
            onChange={(e) => setTree({ ...tree, tree_height: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-base font-medium mb-1">
            วันที่ออกดอก
          </label>
          <input
            type="date"
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.flower_date?.split("T")[0] || ""}
            onChange={(e) => setTree({ ...tree, flower_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-base font-medium mb-1">จำนวนผล</label>
          <input
            type="number"
            className="w-full border px-4 py-2 rounded-xl"
            value={tree.fruit_count || 0}
            onChange={(e) =>
              setTree({ ...tree, fruit_count: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <button
            onClick={saveTree}
            className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            disabled={saving}
          >
            💾 บันทึกข้อมูลต้นไม้
          </button>
          <button
            onClick={createNewTree}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            🌱 ปลูกต้นใหม่ในจุดนี้
          </button>
        </div>
      </div>

      <hr className="my-8" />

      <h2 className="text-lg font-semibold mb-4">
        📜 ประวัติต้นไม้ทั้งหมดในจุด {(id as string).toUpperCase()}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">ต้นที่</th>
              <th className="border px-3 py-2">สายพันธุ์</th>
              <th className="border px-3 py-2">ปลูก</th>
              <th className="border px-3 py-2">ตาย</th>
              <th className="border px-3 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {history.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="border px-3 py-2">{t.tree_number}</td>
                <td className="border px-3 py-2">{t.variety || "-"}</td>
                <td className="border px-3 py-2">
                  {t.planted_date?.split("T")[0]}
                </td>
                <td className="border px-3 py-2">{t.death_date || "-"}</td>
                <td className="border px-3 py-2">
                  {t.status === "alive" ? "🌱" : "🪦"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
