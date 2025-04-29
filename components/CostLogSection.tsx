// components/CostLogSection.tsx
"use client";

export type CostLog = {
  id: string;
  cost_date: string;
  activity_type: string;
  target: string;
  amount: number;
  notes: string | null;
};

interface CostLogSectionProps {
  logs: CostLog[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export default function CostLogSection({
  logs,
  page,
  totalPages,
  onPageChange,
}: CostLogSectionProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">💰 Cost Logs</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">ไม่มีบันทึกค่าใช้จ่าย</p>
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((cost) => (
              <div
                key={cost.id}
                className="border rounded-xl p-4 shadow hover:shadow-lg bg-white"
              >
                <p>
                  <strong>📅</strong> {cost.cost_date}
                </p>
                <p>
                  <strong>⚡</strong> {cost.activity_type}
                </p>
                <p>
                  <strong>🎯</strong> {cost.target}
                </p>
                <p>
                  <strong>💸</strong> {cost.amount.toLocaleString()} บาท
                </p>
                {cost.notes && (
                  <p>
                    <strong>📝</strong> {cost.notes}
                  </p>
                )}
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
