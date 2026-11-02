"use client";

import { useState } from "react";

export default function EventDetailsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [srn, setSrn] = useState("");
  const [success, setSuccess] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-blue-600">
          Event Registration
        </h1>

        <p className="mt-4 text-gray-600">
          Complete your registration below.
        </p>

        {success ? (
          <h2 className="mt-6 text-xl font-bold text-green-600">
            Registration Successful!
          </h2>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSuccess(true);
            }}
            className="mt-8 space-y-6"
          >
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-4 border rounded-lg bg-white text-gray-900 placeholder-gray-400"
            />

            <input
              type="email"
              placeholder="College Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 border rounded-lg bg-white text-gray-900 placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Student SRN"
              value={srn}
              onChange={(e) => setSrn(e.target.value)}
              required
              className="w-full p-4 border rounded-lg bg-white text-gray-900 placeholder-gray-400"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700"
            >
              Confirm Registration
            </button>
          </form>
        )}
      </div>
    </main>
  );
}