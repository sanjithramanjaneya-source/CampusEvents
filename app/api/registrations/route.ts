import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// The logged-in user's own registrations (for the student dashboard).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please log in." }, { status: 401 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         r.registration_id, r.status AS registration_status, r.registered_at,
         e.event_id, e.event_name, e.category, e.start_time, e.end_time,
         e.status AS event_status,
         v.venue_name, v.location
       FROM registrations r
       JOIN events e ON r.event_id = e.event_id
       JOIN venues v ON e.venue_id = v.venue_id
       WHERE r.user_id = ?
       ORDER BY e.start_time`,
      [user.user_id]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/registrations failed:", err);
    return Response.json({ error: "Could not load registrations." }, { status: 500 });
  }
}