"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    alert("Login UI working! Backend authentication will be connected later.");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        <Link href="/" className="text-blue-600 font-bold text-2xl">
          CampusEvents
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Welcome Back!
        </h1>

        <p className="text-gray-600 mt-2">
          Login to discover and register for campus events.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          <div>
            <label className="block text-gray-800 font-medium mb-2">
              Email Address
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
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
            />
          </div>

          <div className="text-right">
            <Link href="#" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

