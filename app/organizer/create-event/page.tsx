"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Venue } from "@/lib/types";

const input =
  "w-full p-3 border border-gray-300 rounded-lg bg-white text-black";
const label = "block text-gray-800 font-medium mb-2";

export default function CreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [deadline, setDeadline] = useState("");
  const [venueId, setVenueId] = useState("");
  const [participants, setParticipants] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
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
          endDate,
          endTime,
          deadline,
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

      // Upload the banner (if any) now that the event exists.
      if (banner && data.event_id) {
        const form = new FormData();
        form.append("banner", banner);
        const up = await fetch(`/api/organizer/events/${data.event_id}/banner`, {
          method: "POST",
          body: form,
        });
        if (!up.ok) {
          const upData = await up.json();
          alert(`Event created, but the banner failed: ${upData.error}`);
        }
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
              <label className={label}>Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                required
                maxLength={150}
                className={input}
              />
            </div>

            <div>
              <label className={label}>Event Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your event"
                required
                rows={4}
                className={input}
              />
            </div>

            <div>
              <label className={label}>Event Banner (optional, JPG/PNG/WebP, max 2 MB)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
                className={input}
              />
            </div>

            <div>
              <label className={label}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={input}
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
                <label className={label}>Start Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={input} />
              </div>
              <div>
                <label className={label}>Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={input} />
              </div>
              <div>
                <label className={label}>End Date (leave empty if same day)</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} />
              </div>
              <div>
                <label className={label}>End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={input} />
              </div>
            </div>

            <div>
              <label className={label}>
                Registration Deadline (leave empty to allow registration until the event starts)
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={input}
              />
            </div>

            <div>
              <label className={label}>Venue</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                required
                className={input}
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
              <label className={label}>Seats Available (maximum participants)</label>
              <input
                type="number"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Enter the number of seats"
                min="1"
                required
                className={input}
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