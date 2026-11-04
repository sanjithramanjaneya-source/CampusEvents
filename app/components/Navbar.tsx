"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type NavUser = {
  full_name: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
} | null;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<NavUser>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Ask the server who is logged in whenever the page changes.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "ORGANIZER"
        ? "/organizer"
        : "/dashboard";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  }

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

          {user ? (
            <>
              <Link href={dashboardHref} className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <span className="text-gray-500 text-sm">{user.full_name}</span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Register</Link>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-4 mt-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/events" onClick={() => setMenuOpen(false)}>Events</Link>
          {user ? (
            <>
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="text-left">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}