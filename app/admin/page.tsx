"use client";

import Link from "next/link";

export default function AdminPage() {
  const pendingEvents = [
    {
      id: 1,
      name: "AI Innovation Workshop",
      organizer: "AI Club",
      date: "November 25, 2026",
      category: "Technical",
    },
    {
      id: 2,
      name: "Photography Exhibition",
      organizer: "Photography Club",
      date: "November 28, 2026",
      category: "Cultural",
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
          <Link href="/login" className="text-gray-700 hover:text-blue-600">
            Logout
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage the CampusEvents platform.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Students</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">850</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Organizers</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">35</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Total Events</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">48</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-600">Pending Approvals</p>
            <h2 className="text-3xl font-bold text-orange-600 mt-2">
              {pendingEvents.length}
            </h2>
          </div>
        </div>

        {/* Pending Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Pending Event Approvals
          </h2>

          <div className="space-y-4">
            {pendingEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Organizer: {event.organizer}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Date: {event.date}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Category: {event.category}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => alert(`${event.name} approved!`)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => alert(`${event.name} rejected!`)}
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
              View and manage student accounts.
            </p>
            <button
              onClick={() => alert("Student management will be connected later.")}
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
              onClick={() => alert("Organizer management will be connected later.")}
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
              onClick={() => alert("Reports will be connected later.")}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              View Reports →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

