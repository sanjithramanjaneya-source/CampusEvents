import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { feedbackCollection } from "@/lib/mongo";

type Ctx = { params: Promise<{ id: string }> };

function readId(raw: string) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Reviews and rating summary for an event (stored in MongoDB).
export async function GET(_request: Request, { params }: Ctx) {
  const eventId = readId((await params).id);
  if (!eventId) return Response.json({ error: "Invalid event id." }, { status: 400 });

  try {
    const col = await feedbackCollection();

    // One aggregation pipeline builds the whole summary in a single trip.
    const [result] = await col
      .aggregate([
        { $match: { event_id: eventId } },
        {
          $facet: {
            summary: [
              { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
            ],
            distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
            recent: [
              { $sort: { created_at: -1 } },
              { $limit: 10 },
              { $project: { _id: 0, user_name: 1, rating: 1, comment: 1, created_at: 1 } },
            ],
          },
        },
      ])
      .toArray();

    const summary = result?.summary?.[0];
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of result?.distribution ?? []) distribution[d._id] = d.count;

    const user = await getCurrentUser();
    const mine = user
      ? await col.findOne(
          { event_id: eventId, user_id: user.user_id },
          { projection: { _id: 0, rating: 1, comment: 1 } }
        )
      : null;

    return Response.json({
      average: summary ? Number(summary.average.toFixed(1)) : 0,
      count: summary?.count ?? 0,
      distribution,
      reviews: result?.recent ?? [],
      mine,
    });
  } catch (err) {
    console.error("GET feedback failed:", err);
    return Response.json({ error: "Reviews are temporarily unavailable." }, { status: 503 });
  }
}

// Leave or update a review. Body: { rating: 1-5, comment }
export async function POST(request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });
  const eventId = readId((await params).id);
  if (!eventId) return Response.json({ error: "Invalid event id." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const rating = Number(body.rating);
  const comment = String(body.comment ?? "").trim().slice(0, 500);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }

  try {
    // MySQL knows who really attended; MongoDB only stores the review.
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 AS ok
         FROM registrations r
         JOIN events e ON e.event_id = r.event_id
        WHERE r.event_id = ? AND r.user_id = ?
          AND r.status = 'ATTENDED' AND e.end_time <= NOW()`,
      [eventId, user.user_id]
    );
    if (rows.length === 0) {
      return Response.json(
        { error: "Only students who attended can review an event, after it ends." },
        { status: 403 }
      );
    }

    const col = await feedbackCollection();
    await col.updateOne(
      { event_id: eventId, user_id: user.user_id },
      {
        $set: { user_name: user.full_name, rating, comment, updated_at: new Date() },
        $setOnInsert: { created_at: new Date() },
      },
      { upsert: true }
    );
    return Response.json({ message: "Thanks for your feedback!" }, { status: 201 });
  } catch (err) {
    console.error("POST feedback failed:", err);
    return Response.json({ error: "Could not save your review." }, { status: 500 });
  }
}