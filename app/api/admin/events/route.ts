import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const STATUSES = ["PENDING", "APPROVED", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED"];

// All events, optionally filtered by ?status=PENDING
export async function GET(request: Request) {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  try {
    const status = new URL(request.url).searchParams.get("status") ?? "";
    if (status && !STATUSES.includes(status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }

    let sql = `
      SELECT e.event_id, e.event_name, e.category, e.start_time, e.end_time,
             e.expected_attendees, e.status,
             u.full_name AS organizer_name, v.venue_name, v.capacity
        FROM events e
        JOIN users u ON e.organizer_id = u.user_id
        JOIN venues v ON e.venue_id = v.venue_id`;
    const params: string[] = [];
    if (status) {
      sql += " WHERE e.status = ?";
      params.push(status);
    }
    sql += " ORDER BY e.start_time";

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/admin/events failed:", err);
    return Response.json({ error: "Could not load events." }, { status: 500 });
  }
}