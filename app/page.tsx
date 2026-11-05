import Link from "next/link";
import { CalendarDays, Users, MapPin, ArrowRight } from "lucide-react";
import UpcomingEvents from "@/app/components/UpcomingEvents";

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

        <UpcomingEvents />
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