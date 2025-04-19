// app/log/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function LogPage() {
  const [trees, setTrees] = useState<any[]>([]);
  const [selectedTree, setSelectedTree] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fertilizers, setFertilizers] = useState<string[]>([]);
  const [pesticides, setPesticides] = useState<string[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedFertilizer, setSelectedFertilizer] = useState("");
  const [selectedPesticide, setSelectedPesticide] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchTrees();
    fetchDropdowns();
  }, []);

  async function fetchTrees() {
    const { data, error } = await supabase.from("trees").select("*");
    if (!error && data) setTrees(data);
  }

  async function fetchDropdowns() {
    const [f, p, u] = await Promise.all([
      supabase.from("fertilizers").select("*"),
      supabase.from("pesticides").select("*"),
      supabase.from("users").select("*"),
    ]);
    if (!f.error) setFertilizers(f.data.map((x: any) => x.name));
    if (!p.error) setPesticides(p.data.map((x: any) => x.name));
    if (!u.error) setUsers(u.data.map((x: any) => x.name));
  }

  async function uploadImage(treeId: string) {
    if (!image) return null;
    const filename = `${treeId}_${Date.now()}_${image.name}`.replace(
      /\s+/g,
      "_"
    );
    const { data, error } = await supabase.storage
      .from("tree-media")
      .upload(filename, image);
    if (error) {
      console.error("Upload error:", error.message);
      alert("❌ ไม่สามารถอัปโหลดรูปภาพได้");
      return null;
    }
    return `tree-media/${data.path}`;
  }

  async function saveLog() {
    if (!selectedTree || !note) return alert("กรุณาเลือกต้นไม้และกรอกหมายเหตุ");
    setLoading(true);
    const imagePath = await uploadImage(selectedTree);
    const { error } = await supabase.from("tree_logs").insert({
      tree_id: selectedTree,
      log_date: new Date().toISOString().split("T")[0],
      notes: note,
      fertilizer: selectedFertilizer,
      pesticide: selectedPesticide,
      created_by: selectedUser,
      image_path: imagePath || null,
    });
    setLoading(false);
    if (error) alert("เกิดข้อผิดพลาดในการบันทึก");
    else {
      alert("บันทึกเรียบร้อยแล้ว");
      setNote("");
      setImage(null);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        ➕ บันทึกข้อมูลต้นไม้
      </h1>

      <label className="block mb-2 font-medium">เลือกต้นไม้</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        onChange={(e) => setSelectedTree(e.target.value)}
      >
        <option value="">-- กรุณาเลือก --</option>
        {trees.map((tree) => (
          <option key={tree.id} value={tree.id}>
            {tree.location_id} - {tree.variety}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">เลือกปุ๋ย</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        onChange={(e) => setSelectedFertilizer(e.target.value)}
      >
        <option value="">-- ไม่ระบุ --</option>
        {fertilizers.map((f, i) => (
          <option key={i} value={f}>
            {f}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">เลือกสารกำจัดศัตรูพืช</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        onChange={(e) => setSelectedPesticide(e.target.value)}
      >
        <option value="">-- ไม่ระบุ --</option>
        {pesticides.map((p, i) => (
          <option key={i} value={p}>
            {p}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">ชื่อผู้บันทึก</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">-- ไม่ระบุ --</option>
        {users.map((u, i) => (
          <option key={i} value={u}>
            {u}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">บันทึกหมายเหตุ</label>
      <textarea
        className="w-full border rounded px-3 py-2 mb-4"
        rows={4}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      ></textarea>

      <label className="block mb-2 font-medium">แนบรูปภาพ</label>
      <input
        type="file"
        className="w-full mb-4"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <button
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={saveLog}
        disabled={loading}
      >
        💾 บันทึกข้อมูล
      </button>
    </main>
  );
}
