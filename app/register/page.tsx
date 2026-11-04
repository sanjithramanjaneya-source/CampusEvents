"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [srn, setSrn] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, srn, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Registration failed");
      return;
    }

    alert("Account created! Please log in.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-lg">

        <Link href="/" className="text-blue-600 font-bold text-2xl">
          CampusEvents
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Create Account
        </h1>

        <p className="text-gray-600 mt-2">
          Join CampusEvents and discover campus activities.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              University Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Student Registration Number (SRN)
            </label>
            <input
              type="text"
              value={srn}
              onChange={(e) => setSrn(e.target.value)}
              placeholder="e.g. PES2UG24CS455"  
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}