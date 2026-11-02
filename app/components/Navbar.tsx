
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          CampusEvents
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-700 text-2xl"
        >
          ☰
        </button>

        <div className="hidden md:flex gap-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
          <Link
  href="/events"
  className={`${
    pathname === "/events" || pathname.startsWith("/events/")
      ? "text-blue-600 font-semibold"
      : "text-gray-700"
  } hover:text-blue-600`}
>
  Events
</Link>
          <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register</Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/events" onClick={() => setMenuOpen(false)}>Events</Link>
          <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        </div>
      )}
    </nav>
  );
}
