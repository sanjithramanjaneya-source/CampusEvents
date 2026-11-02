"use client";

import Link from "next/link";

export default function OrganizerPage() {
  const events = [
    {
      id: 1,
      name: "Tech Hackathon 2026",
      date: "November 15, 2026",
      attendees: 120,
      status: "Published",
    },
    {
      id: 2,
      name: "Cultural Fest",
      date: "November 20, 2026",
      attendees: 250,
      status: "Published",
    },
    {
      id: 3,
      name: "AI Workshop",
      date: "November 25, 2026",
      attendees: 80,
      status: "Draft",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CampusEvents
        </Link>

        <div className="flex gap-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          <Link href="/events" className="text-gray-700 hover:text-blue-600">
            Events
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-blue-600">
            Logout
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organizer Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your campus events.
            </p>
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
              {events.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Published Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {events.filter((event) => event.status === "Published").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Attendees</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {events.reduce((total, event) => total + event.attendees, 0)}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Events
          </h2>

          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 mt-1">📅 {event.date}</p>
                  <p className="text-gray-600 mt-1">
                    👥 {event.attendees} attendees
                  </p>
                </div>

                <div className="flex items-center">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      event.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

