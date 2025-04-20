// app/tree/[id]/page.tsx — variety dropdown from Supabase table
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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
      const locationId = id.toUpperCase();
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
    return <p className="text-center mt-10">⏳ กำลังโหลดข้อมูล...</p>;
  if (!tree)
    return (
      <p className="text-center mt-10">
        ❌ ไม่พบข้อมูลต้นไม้ในจุด {id?.toUpperCase()}
      </p>
    );

  return (
    <main className="max-w-xl mx-auto p-4">
      <Link href="/">🏠 Home</Link>
      <h1 className="text-xl font-bold mb-4 text-center">
        🌳 โปรไฟล์ต้นไม้ {id?.toUpperCase()}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">สายพันธุ์</label>
          <select
            className="w-full border px-3 py-2 rounded"
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
          <label className="block font-medium">วันที่ปลูก</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={tree.planted_date?.split("T")[0] || ""}
            onChange={(e) => setTree({ ...tree, planted_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-medium">สถานะ</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={tree.status || "alive"}
            onChange={(e) => setTree({ ...tree, status: e.target.value })}
          >
            <option value="alive">🌱 มีชีวิต</option>
            <option value="dead">🪦 ตายแล้ว</option>
          </select>
        </div>

        {tree.status === "dead" && (
          <div>
            <label className="block font-medium">📅 วันที่ตาย</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={tree.death_date || ""}
              onChange={(e) => setTree({ ...tree, death_date: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block font-medium">ขนาดต้นไม้ (เมตร)</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={tree.tree_height || ""}
            onChange={(e) => setTree({ ...tree, tree_height: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-medium">วันที่ออกดอก</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={tree.flower_date?.split("T")[0] || ""}
            onChange={(e) => setTree({ ...tree, flower_date: e.target.value })}
          />
        </div>

        <div>
          <label className="block font-medium">จำนวนผล</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={tree.fruit_count || 0}
            onChange={(e) =>
              setTree({ ...tree, fruit_count: parseInt(e.target.value) || 0 })
            }
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={saveTree}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={saving}
          >
            💾 บันทึกข้อมูลต้นไม้
          </button>
          <button
            onClick={createNewTree}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            🌱 ปลูกต้นใหม่ในจุดนี้
          </button>
        </div>
      </div>

      <hr className="my-8" />

      <h2 className="text-lg font-semibold mb-2">
        📜 ประวัติต้นไม้ทั้งหมดในจุด {id?.toUpperCase()}
      </h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ต้นที่</th>
            <th className="border px-2 py-1">สายพันธุ์</th>
            <th className="border px-2 py-1">ปลูก</th>
            <th className="border px-2 py-1">ตาย</th>
            <th className="border px-2 py-1">สถานะ</th>
          </tr>
        </thead>
        <tbody>
          {history.map((t) => (
            <tr key={t.id} className="text-center">
              <td className="border px-2 py-1">{t.tree_number}</td>
              <td className="border px-2 py-1">{t.variety || "-"}</td>
              <td className="border px-2 py-1">
                {t.planted_date?.split("T")[0]}
              </td>
              <td className="border px-2 py-1">{t.death_date || "-"}</td>
              <td className="border px-2 py-1">
                {t.status === "alive" ? "🌱" : "🪦"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
