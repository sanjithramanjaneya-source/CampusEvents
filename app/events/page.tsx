"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { formatDate, formatTime, crowdStyles } from "@/lib/format";

const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshop", "Other"];

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState(""); // the search that was actually submitted
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState<EventItem[] | null>(null); // null = loading
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
          setError("");
        } else {
          setError(data.error || "Could not load events.");
        }
      })
      .catch(() => setError("Could not load events."));
  }, [query, category]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search.trim());
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="font-semibold text-blue-600">CAMPUS EVENTS</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">All Events</h1>
        <p className="mt-2 text-gray-600">
          Browse approved campus events and register.
        </p>

        {/* Search + filter */}
        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-3 md:flex-row"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, description or venue"
            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white p-3 text-black md:w-52"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {error && (
          <p className="mt-8 rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
        )}

        {!error && events === null && (
          <p className="mt-10 text-gray-600">Loading events...</p>
        )}

        {events && events.length === 0 && (
          <p className="mt-10 text-gray-600">No events match your search.</p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <div
              key={event.event_id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between bg-blue-600 px-6 py-4">
                <span className="rounded-full bg-white px-4 py-1 text-sm font-medium text-blue-600">
                  {event.category}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${crowdStyles[event.crowd_level]}`}
                >
                  Crowd: {event.crowd_level}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {event.event_name}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-blue-600" />
                    {formatDate(event.start_time)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    {event.venue_name}, {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    {event.registered_count} / {event.capacity} registered
                  </div>
                </div>

                <Link
                  href={`/events/${event.event_id}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                >
                  View Details <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}