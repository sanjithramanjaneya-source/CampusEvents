"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { MyRegistration } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/format";

const badge: Record<string, { label: string; style: string }> = {
  REGISTERED: { label: "Upcoming", style: "bg-green-100 text-green-700" },
  ATTENDED: { label: "Attended", style: "bg-purple-100 text-purple-700" },
  CANCELLED: { label: "Cancelled", style: "bg-gray-100 text-gray-600" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
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
        setStudentName(me.user.full_name);
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

  const registered = (items ?? []).filter(
    (i) => i.registration_status !== "CANCELLED"
  );
  const upcoming = (items ?? []).filter(
    (i) =>
      i.registration_status === "REGISTERED" &&
      ["APPROVED", "ONGOING"].includes(i.event_status)
  );
  const completed = (items ?? []).filter(
    (i) => i.registration_status === "ATTENDED"
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {studentName || "Student"}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
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
            <p className="text-gray-600">Completed Events</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {completed.length}
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
            {items?.map((item) => {
              const b = badge[item.registration_status];
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
                    {item.registration_status === "REGISTERED" && (
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