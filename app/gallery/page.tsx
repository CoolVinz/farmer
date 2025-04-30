// app/gallery/page.tsx — Gallery with filter, modal preview, and pagination
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function GalleryPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    const { data, error } = await supabase
      .from("tree_logs")
      .select("id, tree_id, notes, image_path, log_date, trees(location_id)")
      .not("image_path", "is", null)
      .order("log_date", { ascending: false });

    if (!error && data) setLogs(data);
  }

  const filtered = logs.filter((log) =>
    filter
      ? (log.trees?.location_id || log.tree_id || "")
          .toLowerCase()
          .includes(filter.toLowerCase())
      : true
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <main className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🖼️ แกลเลอรีรูปภาพต้นไม้</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all"
        >
          🏠 <span className="hidden sm:inline">กลับหน้าหลัก</span>
        </Link>
      </div>

      <input
        type="text"
        placeholder="ค้นหาด้วยตำแหน่งที่ปลูก..."
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(1);
        }}
        className="mb-6 w-full border px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400"
      />

      {paginated.length === 0 ? (
        <p className="text-gray-500">ไม่มีรูปภาพที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginated.map((log) => (
            <div
              key={log.id}
              className="rounded-xl overflow-hidden shadow hover:shadow-lg transition bg-white relative"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tree-media/${log.image_path}`}
                alt={log.notes || "Tree image"}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() =>
                  setPreviewUrl(
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tree-media/${log.image_path}`
                  )
                }
              />
              <div className="p-3">
                <p className="text-sm text-gray-700 font-semibold">
                  🌳 {log.tree_id}
                </p>
                <p className="text-sm text-gray-600">
                  📍 ตำแหน่ง: {log.trees?.location_id || "-"}
                </p>
                <p className="text-xs text-gray-500">📅 {log.log_date}</p>
                <p className="text-sm mt-1">📝 {log.notes || "-"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                page === n ? "bg-blue-600 text-white" : "bg-white text-blue-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            className="max-w-full max-h-[90vh] rounded-xl shadow-lg border-4 border-white"
            alt="Preview"
          />
        </div>
      )}
    </main>
  );
}
