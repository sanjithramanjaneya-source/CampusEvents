"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { OrganizerEvent } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/format";

const statusStyle: Record<string, { label: string; style: string }> = {
  PENDING: { label: "Pending approval", style: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", style: "bg-green-100 text-green-700" },
  ONGOING: { label: "Ongoing", style: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completed", style: "bg-gray-100 text-gray-700" },
  CANCELLED: { label: "Cancelled", style: "bg-red-100 text-red-700" },
};

export default function OrganizerPage() {
  const router = useRouter();
  const [events, setEvents] = useState<OrganizerEvent[] | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // bump to reload the list

  useEffect(() => {
    fetch("/api/organizer/events")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (res.ok) {
          setEvents(data);
          setError("");
        } else {
          setError(data.error || "Could not load your events.");
        }
      })
      .catch(() => setError("Could not load your events."));
  }, [router, reloadKey]);

  async function runAction(
    eventId: number,
    method: "PATCH" | "DELETE",
    question: string
  ) {
    if (!confirm(question)) return;
    const res = await fetch(`/api/organizer/events/${eventId}`, { method });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Action failed.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  const list = events ?? [];
  const live = list.filter((e) => ["APPROVED", "ONGOING"].includes(e.status));
  const totalRegistrations = list
    .filter((e) => e.status !== "CANCELLED")
    .reduce((total, e) => total + Number(e.registered_count), 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Manage your campus events.</p>
          </div>

          <Link
            href="/organizer/create-event"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
          >
            + Create Event
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Events</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {list.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Live Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {live.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Registrations</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {totalRegistrations}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Events</h2>

          {error && (
            <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
          )}

          {!error && events === null && (
            <p className="text-gray-600">Loading your events...</p>
          )}

          {events && events.length === 0 && (
            <p className="text-gray-600">
              You have not created any events yet.
            </p>
          )}

          <div className="space-y-4">
            {list.map((event) => {
              const s = statusStyle[event.status];
              const canCancel = ["PENDING", "APPROVED", "ONGOING"].includes(
                event.status
              );
              const canDelete = ["PENDING", "CANCELLED"].includes(event.status);
              return (
                <div
                  key={event.event_id}
                  className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
                >
                  <div>
                    <Link
                      href={`/events/${event.event_id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {event.event_name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      📅 {formatDate(event.start_time)},{" "}
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </p>
                    <p className="text-gray-600 mt-1">📍 {event.venue_name}</p>
                    <p className="text-gray-600 mt-1">
                      👥 {event.registered_count} registered (expected{" "}
                      {event.expected_attendees})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${s.style}`}
                    >
                      {s.label}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() =>
                          runAction(
                            event.event_id,
                            "PATCH",
                            "Cancel this event? Its resources will be released."
                          )
                        }
                        className="text-orange-600 border border-orange-300 px-4 py-2 rounded-lg hover:bg-orange-50"
                      >
                        Cancel
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() =>
                          runAction(
                            event.event_id,
                            "DELETE",
                            "Delete this event permanently?"
                          )
                        }
                        className="text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50"
                      >
                        Delete
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