// The database sends dates as text like "2026-11-24 09:00:00".
function toDate(value: string) {
  return new Date(value.replace(" ", "T"));
}

export function formatDate(value: string) {
  return toDate(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value: string) {
  return toDate(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const crowdStyles: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
  UNKNOWN: "bg-gray-100 text-gray-700",
};