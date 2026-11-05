"use client";

import { useEffect, useState } from "react";

type Feedback = {
  average: number;
  count: number;
  distribution: Record<string, number>;
  reviews: { user_name: string; rating: number; comment: string; created_at: string }[];
  mine: { rating: number; comment: string } | null;
};

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

// Reviews live in MongoDB; only students marked "attended" may write one.
export default function EventFeedback({
  eventId,
  status,
  attended,
}: {
  eventId: number;
  status: string;
  attended: boolean;
}) {
  const [data, setData] = useState<Feedback | null>(null);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status !== "COMPLETED") return;
    fetch(`/api/events/${eventId}/feedback`)
      .then(async (res) => {
        const body = await res.json();
        if (res.ok) {
          setData(body);
          setError("");
          if (body.mine) {
            setRating(body.mine.rating);
            setComment(body.mine.comment ?? "");
          }
        } else {
          setError(body.error || "Could not load reviews.");
        }
      })
      .catch(() => setError("Could not load reviews."));
  }, [eventId, status, reloadKey]);

  if (status !== "COMPLETED") return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) {
      alert("Choose a rating first.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/events/${eventId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) {
      alert(body.error || "Could not save your review.");
      return;
    }
    setReloadKey((k) => k + 1);
  }

  return (
    <div className="mt-10 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-bold text-slate-900">Reviews</h2>

      {error && <p className="mt-4 rounded-lg bg-yellow-100 p-3 text-yellow-800">{error}</p>}

      {data && (
        <>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-3xl font-bold text-slate-900">
              {data.count ? data.average.toFixed(1) : "-"}
            </span>
            <div>
              <p className="text-xl text-yellow-500">{stars(Math.round(data.average))}</p>
              <p className="text-sm text-gray-500">
                {data.count} {data.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {data.count > 0 && (
            <div className="mt-4 space-y-1 text-sm text-gray-600">
              {[5, 4, 3, 2, 1].map((n) => (
                <div key={n} className="flex items-center gap-2">
                  <span className="w-8">{n} ★</span>
                  <div className="h-2 flex-1 rounded bg-gray-100">
                    <div
                      className="h-2 rounded bg-yellow-400"
                      style={{ width: `${((data.distribution[n] ?? 0) / data.count) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{data.distribution[n] ?? 0}</span>
                </div>
              ))}
            </div>
          )}

          {attended && (
            <form onSubmit={submit} className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="font-medium text-gray-800">
                {data.mine ? "Update your review" : "Rate this event"}
              </p>
              <div className="mt-2 flex gap-1 text-3xl text-yellow-500">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)}>
                    {n <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Share your experience (optional)"
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-black"
              />
              <button
                type="submit"
                disabled={busy}
                className="mt-3 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Saving..." : "Submit review"}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-4">
            {data.reviews.map((r, i) => (
              <div key={i} className="border-b border-gray-100 pb-4">
                <p className="font-medium text-gray-900">
                  {r.user_name} <span className="text-yellow-500">{stars(r.rating)}</span>
                </p>
                {r.comment && <p className="mt-1 text-gray-700">{r.comment}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}