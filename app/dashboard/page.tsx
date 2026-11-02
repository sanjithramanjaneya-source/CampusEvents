"use client";

import Link from "next/link";

export default function DashboardPage() {
  const studentName = "Student";

  const registeredEvents = [
    {
      id: 1,
      name: "Tech Hackathon 2026",
      date: "November 15, 2026",
      location: "PES University",
      status: "Upcoming",
    },
    {
      id: 2,
      name: "Cultural Fest",
      date: "November 20, 2026",
      location: "Main Auditorium",
      status: "Upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CampusEvents
        </Link>

        <div className="flex gap-6 items-center">
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

      {/* Dashboard Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {studentName}! 👋
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
              {registeredEvents.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Upcoming Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {registeredEvents.filter((event) => event.status === "Upcoming").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Completed Events</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              0
            </h2>
          </div>

        </div>

        {/* Registered Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Registrations
            </h2>

            <Link
              href="/events"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Events
            </Link>
          </div>

          <div className="space-y-4">

            {registeredEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    📅 {event.date}
                  </p>

                  <p className="text-gray-600 mt-1">
                    📍 {event.location}
                  </p>
                </div>

                <div className="flex items-center">
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
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

