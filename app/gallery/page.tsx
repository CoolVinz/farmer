// app/gallery/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function GalleryPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data, error } = await supabase
      .from("tree_logs")
      .select("*, tree:trees(location_id, variety)")
      .order("log_date", { ascending: false })
      .limit(50);

    if (!error && data) setLogs(data.filter((log) => log.image_path));
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">🖼️ แกลเลอรีรูปภาพ</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {logs.map((log, i) => (
          <div key={i} className="border rounded overflow-hidden shadow">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${log.image_path}`}
              alt={`Tree ${log.tree?.location_id}`}
              className="w-full h-60 object-cover"
            />

            <div className="p-3 text-sm">
              <div>
                <strong>ต้น:</strong> {log.tree?.location_id} (
                {log.tree?.variety})
              </div>
              <div>
                <strong>วันที่:</strong> {log.log_date}
              </div>
              <div>
                <strong>หมายเหตุ:</strong> {log.notes}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
