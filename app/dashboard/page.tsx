"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MyRegistration } from "@/lib/types";
import { formatDate, formatTime, hasStarted } from "@/lib/format";

// One clear label per registration, based on BOTH the registration and the event.
function statusLabel(item: MyRegistration) {
  if (item.event_status === "CANCELLED")
    return { label: "Event cancelled", style: "bg-red-100 text-red-700" };
  if (item.registration_status === "CANCELLED")
    return { label: "Cancelled", style: "bg-gray-100 text-gray-600" };
  if (item.registration_status === "ATTENDED")
    return { label: "Attended", style: "bg-purple-100 text-purple-700" };
  if (item.event_status === "ONGOING")
    return { label: "Happening now", style: "bg-blue-100 text-blue-700" };
  if (item.event_status === "COMPLETED")
    return { label: "Event ended", style: "bg-gray-100 text-gray-600" };
  return { label: "Upcoming", style: "bg-green-100 text-green-700" };
}

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<{ name: string; srn: string | null } | null>(null);
  const [items, setItems] = useState<MyRegistration[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // bump to reload the list

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((me) => {
        if (!me.user) {
          router.push("/login");
          return;
        }
        setStudent({ name: me.user.full_name, srn: me.user.srn });
        return fetch("/api/registrations")
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) setItems(data);
            else setError(data.error || "Could not load your registrations.");
          });
      })
      .catch(() => setError("Could not load your dashboard."));
  }, [router, reloadKey]);

  async function cancel(eventId: number) {
    if (!confirm("Cancel this registration?")) return;
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not cancel.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  const list = items ?? [];
  const registered = list.filter(
    (i) => i.registration_status !== "CANCELLED" && i.event_status !== "CANCELLED"
  );
  const upcoming = list.filter(
    (i) => i.registration_status === "REGISTERED" && i.event_status === "APPROVED"
  );
  const attended = list.filter((i) => i.registration_status === "ATTENDED");

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {student?.name || "Student"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {student?.srn ? `SRN: ${student.srn} · ` : ""}
            Here is your campus activity overview.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Registered Events</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {registered.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Upcoming Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {upcoming.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Events Attended</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {attended.length}
            </h2>
          </div>
        </div>

        {/* Registered Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Registrations</h2>

            <Link
              href="/events"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>

          {error && (
            <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
          )}

          {!error && items === null && (
            <p className="text-gray-600">Loading your registrations...</p>
          )}

          {items && items.length === 0 && (
            <p className="text-gray-600">
              You have not registered for any events yet.
            </p>
          )}

          <div className="space-y-4">
            {list.map((item) => {
              const b = statusLabel(item);
              const canCancel =
                item.registration_status === "REGISTERED" &&
                item.event_status === "APPROVED" &&
                !hasStarted(item.start_time);
              return (
                <div
                  key={item.registration_id}
                  className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div>
                    <Link
                      href={`/events/${item.event_id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {item.event_name}
                    </Link>

                    <p className="text-gray-600 mt-1">
                      📅 {formatDate(item.start_time)},{" "}
                      {formatTime(item.start_time)} - {formatTime(item.end_time)}
                      {formatDate(item.end_time) !== formatDate(item.start_time) &&
                        ` (ends ${formatDate(item.end_time)})`}
                    </p>

                    <p className="text-gray-600 mt-1">
                      📍 {item.venue_name}, {item.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${b.style}`}
                    >
                      {b.label}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => cancel(item.event_id)}
                        className="text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}