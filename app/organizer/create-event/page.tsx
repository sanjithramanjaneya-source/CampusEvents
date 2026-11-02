"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateEventPage() {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [participants, setParticipants] = useState("");
  const [organizer, setOrganizer] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    alert("Event created successfully! Backend will be connected later.");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CampusEvents
        </Link>

        <Link
          href="/organizer"
          className="text-gray-700 hover:text-blue-600"
        >
          Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Event
          </h1>

          <p className="text-gray-600 mt-2 mb-8">
            Fill in the details to create your campus event.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Event Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event"
                required
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  Event Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Venue
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Enter event venue"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Maximum Participants
              </label>
              <input
                type="number"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Enter participant limit"
                min="1"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Organizer Name
              </label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="Enter organizer name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Publish Event
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

