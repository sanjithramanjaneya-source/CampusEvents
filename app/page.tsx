import Link from "next/link";
import {
  CalendarDays,
  Users,
  MapPin,
  ArrowRight,
  Clock,
} from "lucide-react";

const events = [
  {
    title: "National Hackathon 2026",
    category: "Technology",
    date: "Nov 15, 2026",
    time: "9:00 AM",
    venue: "Innovation Center",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
  },
  {
    title: "Cultural Fest - Rhythm",
    category: "Cultural",
    date: "Nov 20, 2026",
    time: "5:00 PM",
    venue: "University Auditorium",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  },
  {
    title: "AI & Innovation Workshop",
    category: "Workshop",
    date: "Nov 25, 2026",
    time: "10:00 AM",
    venue: "Seminar Hall",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO SECTION */}
      <section className="px-10 py-24 text-center">
        <p className="mb-4 font-semibold text-blue-600">
          CAMPUS EVENT MANAGEMENT
        </p>

        <h1 className="text-5xl font-bold text-slate-900">
          Discover What&apos;s Happening
          <br />
          On Your Campus
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Explore campus events, register for activities, and
          experience everything your university has to offer.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/events"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Explore Events
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 gap-6 px-10 pb-20 md:grid-cols-3">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <CalendarDays className="mb-4 text-blue-600" size={32} />
          <h3 className="text-xl font-semibold">Discover Events</h3>
          <p className="mt-2 text-gray-600">
            Explore workshops, hackathons, sports events, and seminars.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <Users className="mb-4 text-blue-600" size={32} />
          <h3 className="text-xl font-semibold">Easy Registration</h3>
          <p className="mt-2 text-gray-600">
            Register for events and manage your participation.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          <MapPin className="mb-4 text-blue-600" size={32} />
          <h3 className="text-xl font-semibold">Campus Venues</h3>
          <p className="mt-2 text-gray-600">
            Find event venues and explore campus activities.
          </p>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="px-10 pb-24">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-600">DON&apos;T MISS OUT</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Upcoming Events
            </h2>
            <p className="mt-2 text-gray-600">
              Discover exciting events happening on campus.
            </p>
          </div>

          <Link
            href="/events"
            className="hidden items-center gap-2 font-medium text-blue-600 hover:text-blue-800 sm:flex"
          >
            View All <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-52 w-full object-cover"
                />

                <span className="absolute left-4 top-4 rounded-full bg-white px-4 py-1 text-sm font-medium text-blue-600">
                  {event.category}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900">
                  {event.title}
                </h3>

                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-blue-600" />
                    {event.date}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    {event.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    {event.venue}
                  </div>
                </div>

                <Link
                  href={`/events/${index + 1}`}
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
                >
                  Register Now <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 px-10 py-10 text-center text-white">
        <h2 className="text-xl font-bold">CampusEvents</h2>
        <p className="mt-3 text-sm text-gray-400">
          Making campus experiences unforgettable.
        </p>
        <p className="mt-6 text-sm text-gray-500">
          © 2026 CampusEvents. All rights reserved.
        </p>
      </footer>

    </main>
  );
}

