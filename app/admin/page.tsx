"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminEvent, AdminOverview, AdminUser } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/format";

type Panel = "students" | "organizers" | "reports" | null;

export default function AdminPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [pending, setPending] = useState<AdminEvent[] | null>(null);
  const [users, setUsers] = useState<{ role: string; list: AdminUser[] } | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0); // bump to reload everything

  // Dashboard numbers + pending events
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/overview"),
      fetch("/api/admin/events?status=PENDING"),
    ])
      .then(async ([ovRes, evRes]) => {
        if (ovRes.status === 401) {
          router.push("/login");
          return;
        }
        if (ovRes.status === 403) {
          setError("This page is for administrators only.");
          return;
        }
        const ov = await ovRes.json();
        const ev = await evRes.json();
        if (ovRes.ok && evRes.ok) {
          setOverview(ov);
          setPending(ev);
          setError("");
        } else {
          setError(ov.error || ev.error || "Could not load the dashboard.");
        }
      })
      .catch(() => setError("Could not load the dashboard."));
  }, [router, reloadKey]);

  // Student / organizer lists
  const userRole =
    panel === "students" ? "STUDENT" : panel === "organizers" ? "ORGANIZER" : null;

  useEffect(() => {
    if (!userRole) return;
    fetch(`/api/admin/users?role=${userRole}`)
      .then((res) => res.json())
      .then((data) =>
        setUsers({ role: userRole, list: Array.isArray(data) ? data : [] })
      )
      .catch(() => setError("Could not load users."));
  }, [userRole, reloadKey]);

  async function review(event: AdminEvent, action: "approve" | "reject") {
    const verb = action === "approve" ? "Approve" : "Reject";
    if (!confirm(`${verb} "${event.event_name}"?`)) return;

    const res = await fetch(`/api/admin/events/${event.event_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Action failed.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  async function changeRole(user: AdminUser, role: "STUDENT" | "ORGANIZER") {
    if (!confirm(`Make ${user.full_name} an ${role.toLowerCase()}?`)) return;

    const res = await fetch(`/api/admin/users/${user.user_id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Could not change the role.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  function togglePanel(next: Exclude<Panel, null>) {
    setPanel((current) => (current === next ? null : next));
  }

  const stats = overview?.stats;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage the CampusEvents platform.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700 mb-10">{error}</p>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Students</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.students ?? "-"}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Organizers</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {stats?.organizers ?? "-"}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {stats?.total_events ?? "-"}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Pending Approvals</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {stats?.pending_events ?? "-"}
            </h2>
          </div>
        </div>

        {/* Pending Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Event Approvals
          </h2>

          {pending && pending.length === 0 && (
            <p className="text-gray-600">No events are waiting for approval.</p>
          )}

          <div className="space-y-4">
            {pending?.map((event) => (
              <div
                key={event.event_id}
                className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.event_name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Organizer: {event.organizer_name}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Date: {formatDate(event.start_time)},{" "}
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Venue: {event.venue_name} (capacity {event.capacity}) ·
                    Expected: {event.expected_attendees}
                  </p>
                  <p className="text-gray-600 mt-1">Category: {event.category}</p>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => review(event, "approve")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => review(event, "reject")}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Student Management
            </h3>
            <p className="text-gray-600 mt-2">
              View student accounts and promote organizers.
            </p>
            <button
              onClick={() => togglePanel("students")}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Manage Students →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Organizer Management
            </h3>
            <p className="text-gray-600 mt-2">
              Manage organizer accounts and permissions.
            </p>
            <button
              onClick={() => togglePanel("organizers")}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Manage Organizers →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              Platform Reports
            </h3>
            <p className="text-gray-600 mt-2">
              View platform activity and statistics.
            </p>
            <button
              onClick={() => togglePanel("reports")}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              View Reports →
            </button>
          </div>
        </div>

        {/* Users panel */}
        {userRole && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {userRole === "STUDENT" ? "Students" : "Organizers"}
            </h2>

            {users?.role !== userRole && (
              <p className="text-gray-600">Loading...</p>
            )}

            {users?.role === userRole && users.list.length === 0 && (
              <p className="text-gray-600">No users found.</p>
            )}

            {users?.role === userRole && users.list.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">SRN</th>
                      <th className="py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.list.map((u) => (
                      <tr key={u.user_id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 text-gray-900">{u.full_name}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.email}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.srn ?? "-"}</td>
                        <td className="py-3">
                          <button
                            onClick={() =>
                              changeRole(
                                u,
                                userRole === "STUDENT" ? "ORGANIZER" : "STUDENT"
                              )
                            }
                            className="text-blue-600 font-medium hover:underline"
                          >
                            {userRole === "STUDENT"
                              ? "Make organizer"
                              : "Make student"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reports panel */}
        {panel === "reports" && overview && (
          <div className="mt-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Events by status
                </h2>
                <ul className="space-y-2">
                  {overview.by_status.map((s) => (
                    <li key={s.status} className="flex justify-between text-gray-700">
                      <span>{s.status}</span>
                      <span className="font-semibold">{s.count}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-600">
                  Total active registrations:{" "}
                  <span className="font-semibold">
                    {overview.stats.total_registrations}
                  </span>
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Most popular events
                </h2>
                {overview.top_events.length === 0 && (
                  <p className="text-gray-600">No registrations yet.</p>
                )}
                <ul className="space-y-2">
                  {overview.top_events.map((t) => (
                    <li key={t.event_id} className="flex justify-between text-gray-700">
                      <span>{t.event_name}</span>
                      <span className="font-semibold">
                        {t.registrations} / {t.capacity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Recent activity
              </h2>
              <ul className="space-y-3">
                {overview.recent_activity.map((a) => (
                  <li
                    key={a.audit_id}
                    className="flex flex-col md:flex-row md:justify-between gap-1 text-gray-700 border-b border-gray-100 pb-3"
                  >
                    <span>
                      <span className="font-medium">{a.action_type}</span> ·{" "}
                      {a.description}
                      {a.user_name && (
                        <span className="text-gray-500"> ({a.user_name})</span>
                      )}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {formatDate(a.action_time)} {formatTime(a.action_time)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}