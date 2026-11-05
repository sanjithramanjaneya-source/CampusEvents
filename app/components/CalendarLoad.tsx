"use client";

// Events running on each of the next 14 days (built with a recursive CTE).
export default function CalendarLoad({
  data,
}: {
  data: { cal_date: string; events: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => Number(d.events)));
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Events in the next 14 days
      </h2>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.cal_date} className="flex items-center gap-3 text-sm text-gray-700">
            <span className="w-28">
              {new Date(`${d.cal_date}T00:00:00`).toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <div className="h-3 flex-1 rounded bg-gray-100">
              <div
                className="h-3 rounded bg-blue-500"
                style={{ width: `${(Number(d.events) / max) * 100}%` }}
              />
            </div>
            <span className="w-6 text-right font-semibold">{d.events}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}