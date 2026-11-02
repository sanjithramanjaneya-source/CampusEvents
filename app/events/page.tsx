"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function EventDetails() {
  const params = useParams();
  const id = params.id;

  const [registered, setRegistered] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const registration = {
      eventId: id,
      name: formData.get("name"),
      email: formData.get("email"),
      srn: formData.get("srn"),
    };

    const registrations = JSON.parse(
      localStorage.getItem("registrations") || "[]"
    );

    registrations.push(registration);

    localStorage.setItem(
      "registrations",
      JSON.stringify(registrations)
    );

    setRegistered(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10">

        <h1 className="text-3xl font-bold text-blue-600">
          Event Registration
        </h1>

        <p className="mt-4 text-slate-600">
          Register for Event #{id}
        </p>

        {registered ? (
          <div className="mt-8 bg-green-100 text-green-700 p-5 rounded-lg">
            🎉 Registration successful!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              required
              className="w-full border rounded-lg p-3"
            />

            <input
              name="email"
              type="email"
              placeholder="College Email"
              required
              className="w-full border rounded-lg p-3"
            />

            <input
              name="srn"
              type="text"
              placeholder="Student SRN"
              required
              className="w-full border rounded-lg p-3"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Confirm Registration
            </button>

          </form>
        )}

      </div>
    </div>
  );
}