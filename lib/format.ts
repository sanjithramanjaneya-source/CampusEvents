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
    FULL: "bg-red-100 text-red-700",
  UNKNOWN: "bg-gray-100 text-gray-700",
};



export function formatDateTime(value: string) {
  return `${formatDate(value)}, ${formatTime(value)}`;
}

export function hasStarted(value: string) {
  return new Date() >= toDate(value);
}

// One label that explains whether people can still register.
export function registrationState(e: {
  status: string;
  registration_deadline: string;
  registered_count: number;
  expected_attendees: number;
}) {
  if (e.status === "COMPLETED")
    return { open: false, label: "Event ended", style: "bg-gray-100 text-gray-700" };
  if (e.status === "ONGOING")
    return { open: false, label: "Happening now", style: "bg-blue-100 text-blue-700" };
  if (e.status === "CANCELLED")
    return { open: false, label: "Cancelled", style: "bg-red-100 text-red-700" };
  if (e.status !== "APPROVED")
    return { open: false, label: "Not open yet", style: "bg-yellow-100 text-yellow-700" };
  if (Number(e.registered_count) >= e.expected_attendees)
    return { open: false, label: "Fully booked", style: "bg-red-100 text-red-700" };
  if (new Date() > toDate(e.registration_deadline))
    return { open: false, label: "Registration closed", style: "bg-gray-100 text-gray-700" };
  return { open: true, label: "Registration open", style: "bg-green-100 text-green-700" };
}