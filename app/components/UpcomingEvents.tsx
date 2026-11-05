"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import type { EventItem } from "@/lib/types";
import { formatDate, formatTime, registrationState } from "@/lib/format";

// The next 3 events from the database. Finished events drop out by themselves.
export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/events?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        else setError(data.error || "Could not load events.");
      })
      .catch(() => setError("Could not load events."));
  }, []);

  if (error) return <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>;
  if (events === null) return <p className="text-gray-600">Loading events...</p>;
  if (events.length === 0)
    return <p className="text-gray-600">No upcoming events right now. Check back soon!</p>;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => {
        const state = registrationState(event);
        return (
          <div
            key={event.event_id}
            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative">
              {event.has_banner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/events/${event.event_id}/banner`}
                  alt={event.event_name}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <div className="h-52 w-full bg-gradient-to-br from-blue-500 to-indigo-600" />
              )}

              <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-1 text-sm font-medium text-blue-600">
                {event.category}
              </span>
              <span
                className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${state.style}`}
              >
                {state.label}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="text-xl font-bold text-slate-900">{event.event_name}</h3>

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
                  {event.venue_name}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  {event.registered_count} / {event.expected_attendees} seats taken
                </div>
              </div>

              <Link
                href={`/events/${event.event_id}`}
                className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
              >
                {state.open ? "Register Now" : "View Details"} <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}