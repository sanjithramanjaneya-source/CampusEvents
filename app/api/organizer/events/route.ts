import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshop", "Other"];

// The logged-in organizer's own events.
export async function GET() {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         e.event_id, e.event_name, e.category, e.start_time, e.end_time,
         e.expected_attendees, e.status,
         v.venue_name, v.capacity,
         CountActiveRegistrations(e.event_id) AS registered_count
       FROM events e
       JOIN venues v ON e.venue_id = v.venue_id
       WHERE e.organizer_id = ?
       ORDER BY e.start_time DESC`,
      [auth.user.user_id]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/organizer/events failed:", err);
    return Response.json({ error: "Could not load your events." }, { status: 500 });
  }
}

// Create a new event (starts as PENDING until an admin approves it).
export async function POST(request: Request) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const category = String(body.category ?? "");
    const venueId = Number(body.venueId);
    const date = String(body.date ?? "");
    const startTime = String(body.startTime ?? "");
    const endTime = String(body.endTime ?? "");
    const attendees = Number(body.attendees);

    const valid =
      name &&
      name.length <= 150 &&
      description &&
      CATEGORIES.includes(category) &&
      Number.isInteger(venueId) && venueId > 0 &&
      Number.isInteger(attendees) && attendees > 0 &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      /^\d{2}:\d{2}$/.test(startTime) &&
      /^\d{2}:\d{2}$/.test(endTime);
    if (!valid) {
      return Response.json(
        { error: "Please fill all fields correctly." },
        { status: 400 }
      );
    }

    // The venue-clash, capacity and time rules live in the stored procedure.
    const [result] = await pool.query<RowDataPacket[][]>(
      "CALL CreateEvent(?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        category,
        auth.user.user_id,
        venueId,
        `${date} ${startTime}:00`,
        `${date} ${endTime}:00`,
        attendees,
      ]
    );

    return Response.json(
      {
        message: "Event submitted for admin approval.",
        event_id: result[0]?.[0]?.event_id ?? null,
      },
      { status: 201 }
    );
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string; code?: string };
    if (e.sqlState === "45000") {
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    if (e.code === "ER_TRUNCATED_WRONG_VALUE") {
      return Response.json({ error: "Invalid date or time." }, { status: 400 });
    }
    console.error("POST /api/organizer/events failed:", err);
    return Response.json({ error: "Could not create the event." }, { status: 500 });
  }
}