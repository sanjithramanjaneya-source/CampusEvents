"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import type { EventDetail } from "@/lib/types";
import {
  formatDate,
  formatTime,
  formatDateTime,
  hasStarted,
  crowdStyles,
  registrationState,
} from "@/lib/format";

function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // bump to reload the event

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setEvent(data);
          setError("");
        } else {
          setError(data.error || "Could not load event.");
        }
      })
      .catch(() => setError("Could not load event."));
  }, [id, reloadKey]);

  async function act(method: "POST" | "DELETE") {
    if (method === "DELETE" && !confirm("Cancel your registration?")) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/events/${id}/register`, { method });
      const data = await res.json();
      setNotice({ ok: res.ok, text: data.error || data.message });
      setReloadKey((k) => k + 1);
    } catch {
      setNotice({ ok: false, text: "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  // What should the visitor see in the registration area?
  function registrationArea(e: EventDetail) {
    const state = registrationState(e);
    const mine = e.my_registration;
    const registered = mine === "REGISTERED" || mine === "ATTENDED";
    const box = "rounded-lg px-5 py-3 font-medium";

    if (e.viewer?.user_id === e.organizer_id) {
      return (
        <p className={`${box} bg-blue-50 text-blue-800`}>
          You are the organizer of this event.
        </p>
      );
    }

    if (registered) {
      if (mine === "ATTENDED")
        return <p className={`${box} bg-purple-100 text-purple-700`}>You attended this event.</p>;
      if (e.status === "COMPLETED")
        return (
          <p className={`${box} bg-gray-100 text-gray-700`}>
            You registered for this event. Your attendance was not recorded.
          </p>
        );
      if (e.status === "ONGOING")
        return (
          <p className={`${box} bg-blue-100 text-blue-700`}>
            You are registered. The event is happening now.
          </p>
        );
      return (
        <div className="flex flex-wrap items-center gap-4">
          <span className={`${box} bg-green-100 text-green-700`}>
            You are registered for this event
          </span>
          {mine === "REGISTERED" && !hasStarted(e.start_time) && (
            <button
              onClick={() => act("DELETE")}
              disabled={busy}
              className="rounded-lg border border-red-300 px-5 py-3 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Cancel registration
            </button>
          )}
        </div>
      );
    }

    if (state.open) {
      return e.viewer ? (
        <button
          onClick={() => act("POST")}
          disabled={busy}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "Please wait..." : "Register for this event"}
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Login to register
        </Link>
      );
    }

    // Registration is not possible: explain why.
    let message = "Registration is not open for this event.";
    if (e.status === "COMPLETED") message = "This event has ended.";
    else if (e.status === "ONGOING")
      message = "This event is in progress. Registration is closed.";
    else if (state.label === "Fully booked")
      message = "This event is fully booked. All seats are taken.";
    else if (state.label === "Registration closed")
      message = `Registration closed on ${formatDateTime(e.registration_deadline)}. The event starts on ${formatDateTime(e.start_time)}.`;
    return <p className={`${box} bg-gray-100 text-gray-700`}>{message}</p>;
  }

  const state = event ? registrationState(event) : null;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/events"
          className="flex items-center gap-2 font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={18} /> Back to events
        </Link>

        {error && (
          <p className="mt-8 rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
        )}

        {!error && !event && (
          <p className="mt-8 text-gray-600">Loading event...</p>
        )}

        {event && state && (
          <div className="mt-6 rounded-2xl bg-white p-8 shadow-lg md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600">
                {event.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${state.style}`}
              >
                {state.label}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${crowdStyles[event.crowd_level]}`}
              >
                Crowd: {event.crowd_level}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              {event.event_name}
            </h1>
            <p className="mt-1 text-gray-600">
              Organized by {event.organizer_name}
            </p>

            <p className="mt-6 text-gray-700">
              {event.description || "No description provided."}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 text-gray-700 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-blue-600" size={20} />
                <span>
                  {formatDate(event.start_time)}
                  {formatDate(event.end_time) !== formatDate(event.start_time) &&
                    ` → ${formatDate(event.end_time)}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-blue-600" size={20} />
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600" size={20} />
                {event.venue_name}, {event.location}
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" size={20} />
                {event.registered_count} / {event.expected_attendees} seats taken
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Registration deadline: {formatDateTime(event.registration_deadline)}
            </p>

            {/* Registration */}
            <div className="mt-8">
              {notice && (
                <p
                  className={`mb-4 rounded-lg p-4 ${
                    notice.ok
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {notice.text}
                </p>
              )}
              {registrationArea(event)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-gray-600">Loading event...</p>}>
      <EventDetails />
    </Suspense>
  );
}