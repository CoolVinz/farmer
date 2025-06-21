// components/SingleLogSection.tsx
"use client";

import Image from "next/image";

export type SingleLog = {
  id: string;
  tree_id: string;
  log_date: string;
  notes: string | null;
  activity_type: string | null;
  health_status?: string | null;
  fertilizer_type?: string | null;
  image_path?: string | null; // here it’s just the filename
  tree: { location_id: string; tree_number: string; variety: string };
};

interface SingleLogSectionProps {
  logs: SingleLog[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const MINIO_ENDPOINT = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || process.env.MINIO_ENDPOINT;
const MINIO_BUCKET = process.env.NEXT_PUBLIC_MINIO_BUCKET || process.env.MINIO_BUCKET || 'tree-media';

export default function SingleLogSection({
  logs,
  page,
  totalPages,
  onPageChange,
}: SingleLogSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">🌳 Log รายต้น</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">ไม่มีบันทึกต้นไม้รายต้น</p>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => {
              // log.image_path is just the filename, so prepend your bucket name:
              const filename = log.image_path?.replace(/^\/+/, "") || "";
              const src = filename
                ? `${MINIO_ENDPOINT}/${MINIO_BUCKET}/${filename}`
                : "";

              return (
                <div
                  key={log.id}
                  className="border rounded-xl p-4 shadow hover:shadow-lg bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p>
                        <strong>📅</strong> {log.log_date}
                      </p>
                      <p>
                        <strong>🌳</strong> {log.tree.location_id}
                        {log.tree.tree_number} — {log.tree.variety}
                      </p>
                      {log.activity_type && (
                        <p>
                          <strong>⚡</strong> {log.activity_type}
                        </p>
                      )}
                      {log.health_status && (
                        <p>
                          <strong>🌿</strong> {log.health_status}
                        </p>
                      )}
                      {log.fertilizer_type && (
                        <p>
                          <strong>💊</strong> {log.fertilizer_type}
                        </p>
                      )}
                      {log.notes && (
                        <p>
                          <strong>📝</strong> {log.notes}
                        </p>
                      )}
                    </div>
                    {src && (
                      <div className="flex-shrink-0">
                        {/* Use plain <img> or switch to <Image> once it's working */}
                        <img
                          src={src}
                          alt="Tree Log Photo"
                          width={160}
                          height={120}
                          className="rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 disabled:opacity-50"
            >
              ◀️ ก่อนหน้า
            </button>
            <span>
              หน้า {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 disabled:opacity-50"
            >
              ถัดไป ▶️
            </button>
          </div>
        </>
      )}
    </section>
  );
}
