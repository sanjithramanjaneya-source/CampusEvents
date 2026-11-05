import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

// Public event list. ?q=search &category=Technical &past=1 (include finished events)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim();
    const past = searchParams.get("past") === "1";

    let sql = `
      SELECT
        e.event_id, e.event_name, e.description, e.category,
        e.start_time, e.end_time, e.registration_deadline,
        e.expected_attendees, e.status,
        v.venue_name, v.location, v.capacity,
        u.full_name AS organizer_name,
        EXISTS(SELECT 1 FROM event_banners b WHERE b.event_id = e.event_id) AS has_banner,
        CountActiveRegistrations(e.event_id) AS registered_count,
        EventCrowdLevel(e.event_id) AS crowd_level
      FROM events e
      JOIN venues v ON e.venue_id = v.venue_id
      JOIN users u ON e.organizer_id = u.user_id
      WHERE e.status IN (${past ? "'APPROVED', 'ONGOING', 'COMPLETED'" : "'APPROVED', 'ONGOING'"})`;
    const params: string[] = [];

    if (q) {
      sql += " AND (e.event_name LIKE ? OR e.description LIKE ? OR v.venue_name LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      sql += " AND e.category = ?";
      params.push(category);
    }
    // Happening-now events first, then by start time
        sql += " ORDER BY (e.status = 'ONGOING') DESC, e.start_time";
    const limit = Number(searchParams.get("limit"));
    if (Number.isInteger(limit) && limit > 0 && limit <= 24) sql += ` LIMIT ${limit}`;

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/events failed:", err);
    return Response.json({ error: "Could not load events." }, { status: 500 });
  }
}