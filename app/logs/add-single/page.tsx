// app/logs/add-single/page.tsx — Add Single Tree Log pulling options from database
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
  const [activities, setActivities] = useState<any[]>([]);
  const [fertilizers, setFertilizers] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [treeId, setTreeId] = useState("");
  const [notes, setNotes] = useState("");
  const [logDate, setLogDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [activityType, setActivityType] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [fertilizerType, setFertilizerType] = useState("");

  useEffect(() => {
    fetchTrees();
    fetchActivities();
    fetchFertilizers();
    fetchDiseases();
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

  async function fetchActivities() {
    const { data } = await supabase.from("activities").select("*");
    if (data) setActivities(data);
  }

  async function fetchFertilizers() {
    const { data } = await supabase.from("fertilizers").select("*");
    if (data) setFertilizers(data);
  }

  async function fetchDiseases() {
    const { data } = await supabase.from("plant_diseases").select("*");
    if (data) setDiseases(data);
  }

  async function handleSubmit() {
    if (!treeId) {
      toast.error("กรุณาเลือกต้นไม้");
      return;
    }

    const finalLogDate = logDate || new Date().toISOString().split("T")[0];
    let imagePath = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${treeId}_${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("tree-media")
        .upload(fileName, imageFile);
      if (uploadError) {
        toast.error("อัปโหลดรูปภาพล้มเหลว");
        return;
      }
      imagePath = data?.path || null;
    }

    const { error } = await supabase.from("tree_logs").insert({
      tree_id: treeId,
      log_date: finalLogDate,
      notes,
      image_path: imagePath,
      activity_type: activityType || null,
      health_status: healthStatus || null,
      fertilizer_type: fertilizerType || null,
    });

    if (!error) {
      toast.success("บันทึกข้อมูลสำเร็จ");
      setTreeId("");
      setNotes("");
      setLogDate("");
      setImageFile(null);
      setPreviewUrl("");
      setActivityType("");
      setHealthStatus("");
      setFertilizerType("");
    } else {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
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
            className="border rounded-xl px-4 py-2 w-full shadow"
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
            className="border rounded-xl px-4 py-2 w-full shadow"
          />

          <textarea
            placeholder="หมายเหตุ (ถ้ามี)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
            rows={3}
          />

          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกประเภทกิจกรรม</option>
            {activities.map((activity: any) => (
              <option key={activity.id} value={activity.name}>
                {activity.name}
              </option>
            ))}
          </select>

          <select
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกสุขภาพต้นไม้</option>
            {diseases.map((disease: any) => (
              <option key={disease.id} value={disease.name}>
                {disease.name}
              </option>
            ))}
          </select>

          <select
            value={fertilizerType}
            onChange={(e) => setFertilizerType(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full shadow"
          >
            <option value="">เลือกสูตรปุ๋ย</option>
            {fertilizers.map((fertilizer: any) => (
              <option key={fertilizer.id} value={fertilizer.name}>
                {fertilizer.name}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              แนบรูปภาพต้นไม้
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-60 object-cover rounded-xl shadow"
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-xl w-full hover:bg-green-700 shadow"
          >
            ✅ บันทึกข้อมูล
          </button>
        </div>
      </main>
    </>
  );
}
