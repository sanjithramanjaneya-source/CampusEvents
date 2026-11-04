"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Venue } from "@/lib/types";

export default function CreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueId, setVenueId] = useState("");
  const [participants, setParticipants] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/venues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVenues(data);
      })
      .catch(() => setError("Could not load venues."));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/organizer/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          description,
          category,
          venueId: Number(venueId),
          date,
          startTime,
          endTime,
          attendees: Number(participants),
        }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not create the event.");
        return;
      }

      alert("Event submitted! It will go live once an admin approves it.");
      router.push("/organizer");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link
          href="/organizer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white p-8 rounded-2xl shadow-sm mt-4">
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
                maxLength={150}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-gray-800 font-medium mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Venue
              </label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              >
                <option value="">Select a venue</option>
                {venues.map((v) => (
                  <option key={v.venue_id} value={v.venue_id}>
                    {v.venue_name} - {v.location} (capacity {v.capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2">
                Expected Participants
              </label>
              <input
                type="number"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Enter expected number of participants"
                min="1"
                required
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {busy ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}