"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { EventDetail } from "@/lib/types";
import { formatRange, formatDateTime, hasStarted } from "@/lib/format";

type Registrant = {
  user_id: number;
  full_name: string;
  email: string;
  srn: string | null;
  status: "REGISTERED" | "ATTENDED";
  registered_at: string;
};
type Resource = {
  resource_id: number;
  resource_name: string;
  resource_type: string;
  total_quantity: number;
  available_quantity: number;
  allocated: number;
};
type Staff = {
  user_id: number;
  full_name: string;
  email: string;
  srn: string | null;
  responsibility: string;
};

const card = "bg-white rounded-xl shadow-sm p-6 mt-8";
const input = "p-3 border border-gray-300 rounded-lg bg-white text-black";

function ManageEvent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    event: EventDetail;
    registrants: Registrant[];
    resources: Resource[];
    staff: Staff[];
  } | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [qty, setQty] = useState<Record<number, string>>({});
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/events/${id}`),
      fetch(`/api/organizer/events/${id}/registrations`),
      fetch(`/api/organizer/events/${id}/resources`),
      fetch(`/api/organizer/events/${id}/staff`),
    ])
      .then(async (responses) => {
        if (responses.some((r) => r.status === 401)) {
          router.push("/login");
          return;
        }
        const bad = responses.find((r) => !r.ok);
        if (bad) {
          const body = await bad.json().catch(() => ({}));
          setError(body.error || "Could not load this event.");
          return;
        }
        const [event, registrants, resources, staff] = await Promise.all(
          responses.map((r) => r.json())
        );
        setData({ event, registrants, resources, staff });
        setError("");
      })
      .catch(() => setError("Could not load this event."));
  }, [id, router, reloadKey]);

  // Send a change to the server, then reload everything.
  async function send(url: string, method: string, body?: unknown, rawForm?: FormData) {
    const res = await fetch(url, {
      method,
      headers: rawForm ? undefined : { "Content-Type": "application/json" },
      body: rawForm ?? (body ? JSON.stringify(body) : undefined),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || "Action failed.");
      return false;
    }
    setReloadKey((k) => k + 1);
    return true;
  }

  async function uploadBanner(file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.append("banner", file);
    await send(`/api/organizer/events/${id}/banner`, "POST", undefined, form);
  }

  async function saveResource(resourceId: number) {
    const ok = await send(`/api/organizer/events/${id}/resources`, "POST", {
      resource_id: resourceId,
      quantity: Number(qty[resourceId]),
    });
    if (ok)
      setQty((q) => {
        const next = { ...q };
        delete next[resourceId];
        return next;
      });
  }

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    const ok = await send(`/api/organizer/events/${id}/staff`, "POST", {
      email: staffEmail,
      responsibility: staffRole,
    });
    if (ok) {
      setStaffEmail("");
      setStaffRole("");
    }
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/organizer" className="text-blue-600 font-medium">← Back to Dashboard</Link>
        <p className="mt-6 rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
      </main>
    );
  }
  if (!data) return <p className="p-10 text-gray-600">Loading...</p>;

  const { event, registrants, resources, staff } = data;
  const started = hasStarted(event.start_time);
  const editable = ["PENDING", "APPROVED"].includes(event.status);
  const attendedCount = registrants.filter((r) => r.status === "ATTENDED").length;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link href="/organizer" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to Dashboard
        </Link>

        {/* Overview + banner */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.event_name}</h1>
              <p className="text-gray-600 mt-2">📅 {formatRange(event.start_time, event.end_time)}</p>
              <p className="text-gray-600 mt-1">📍 {event.venue_name}</p>
              <p className="text-gray-600 mt-1">
                👥 {event.registered_count} / {event.expected_attendees} seats taken · Status:{" "}
                <span className="font-semibold">{event.status}</span>
              </p>
              <p className="text-gray-600 mt-1">
                ⏰ Registration deadline: {formatDateTime(event.registration_deadline)}
              </p>
            </div>
            {event.has_banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/events/${event.event_id}/banner?v=${reloadKey}`}
                alt="Banner"
                className="h-32 w-56 rounded-lg object-cover"
              />
            ) : (
              <div className="h-32 w-56 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600" />
            )}
          </div>

          {editable && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-gray-700 font-medium">
                {event.has_banner ? "Change banner:" : "Add banner:"}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => uploadBanner(e.target.files?.[0])}
                className="text-gray-700"
              />
              {event.has_banner ? (
                <button
                  onClick={() => send(`/api/organizer/events/${id}/banner`, "DELETE")}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Registrants + attendance */}
        <div className={card}>
          <h2 className="text-2xl font-bold text-gray-900">Registrations</h2>
          <p className="text-gray-600 mt-1">
            {registrants.length} registered · {attendedCount} attended
            {!started && " · Attendance can be marked once the event starts."}
          </p>

          {registrants.length === 0 ? (
            <p className="text-gray-600 mt-4">Nobody has registered yet.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">SRN</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Registered</th>
                    <th className="py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {registrants.map((r) => (
                    <tr key={r.user_id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 text-gray-900">{r.full_name}</td>
                      <td className="py-3 pr-4 text-gray-600">{r.srn ?? "-"}</td>
                      <td className="py-3 pr-4 text-gray-600">{r.email}</td>
                      <td className="py-3 pr-4 text-gray-600">{formatDateTime(r.registered_at)}</td>
                      <td className="py-3">
                        {r.status === "ATTENDED" ? (
                          <span className="mr-3 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700">
                            Attended
                          </span>
                        ) : null}
                        <button
                          disabled={!started || !["APPROVED", "ONGOING", "COMPLETED"].includes(event.status)}
                          onClick={() =>
                            send(`/api/organizer/events/${id}/registrations`, "PATCH", {
                              user_id: r.user_id,
                              attended: r.status !== "ATTENDED",
                            })
                          }
                          className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                        >
                          {r.status === "ATTENDED" ? "Undo" : "Mark attended"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resources */}
        <div className={card}>
          <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
          <p className="text-gray-600 mt-1">
            {editable
              ? "Set how many of each item this event needs. Stock updates automatically."
              : "Resources are released when an event ends or is cancelled."}
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="py-3 pr-4">Item</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Free now</th>
                  <th className="py-3">For this event</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.resource_id} className="border-b border-gray-100">
                    <td className="py-3 pr-4 text-gray-900">{r.resource_name}</td>
                    <td className="py-3 pr-4 text-gray-600">{r.resource_type}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {r.available_quantity} / {r.total_quantity}
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        disabled={!editable}
                        value={qty[r.resource_id] ?? String(r.allocated)}
                        onChange={(e) => setQty((q) => ({ ...q, [r.resource_id]: e.target.value }))}
                        className={`${input} w-28 py-2`}
                      />
                      {editable && qty[r.resource_id] !== undefined && (
                        <button
                          onClick={() => saveResource(r.resource_id)}
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff */}
        <div className={card}>
          <h2 className="text-2xl font-bold text-gray-900">Staff &amp; Volunteers</h2>

          {staff.length === 0 ? (
            <p className="text-gray-600 mt-2">No staff assigned yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {staff.map((s) => (
                <li key={s.user_id} className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                  <span className="text-gray-900">
                    {s.full_name} <span className="text-gray-500">({s.srn ?? s.email})</span> -{" "}
                    <span className="font-medium">{s.responsibility}</span>
                  </span>
                  <button
                    onClick={() => send(`/api/organizer/events/${id}/staff`, "DELETE", { user_id: s.user_id })}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!["COMPLETED", "CANCELLED", "REJECTED"].includes(event.status) && (
            <form onSubmit={addStaff} className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="Staff member's email"
                className={`${input} flex-1`}
              />
              <input
                type="text"
                required
                maxLength={100}
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                placeholder="Responsibility (e.g. Registration Desk)"
                className={`${input} flex-1`}
              />
              <button type="submit" className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                Add
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ManageEventPage() {
  return (
    <Suspense fallback={<p className="p-10 text-gray-600">Loading...</p>}>
      <ManageEvent />
    </Suspense>
  );
}