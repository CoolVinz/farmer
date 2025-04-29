// components/BatchLogSection.tsx
"use client";

export type BatchLog = {
  id: string;
  plot_id: string;
  log_date: string;
  notes: string | null;
  activities?: { name: string };
};

interface BatchLogSectionProps {
  logs: BatchLog[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function BatchLogSection({
  logs,
  page,
  totalPages,
  onPageChange,
}: BatchLogSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">🌾 Log ทั้งแปลง</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">ไม่มีบันทึกทั้งแปลง</p>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((batch) => (
              <div
                key={batch.id}
                className="border rounded-xl p-4 shadow hover:shadow-lg bg-white"
              >
                <p>
                  <strong>📅</strong> {batch.log_date}
                </p>
                {batch.activities && (
                  <p>
                    <strong>⚡</strong> {batch.activities.name}
                  </p>
                )}
                {batch.notes && (
                  <p>
                    <strong>📝</strong> {batch.notes}
                  </p>
                )}
                <p className="text-sm text-gray-500">แปลง: {batch.plot_id}</p>
              </div>
            ))}
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
