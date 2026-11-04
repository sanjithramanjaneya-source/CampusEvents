import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

// Venues that can currently be booked.
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT venue_id, venue_name, location, capacity, venue_type
         FROM venues
        WHERE status = 'AVAILABLE'
        ORDER BY venue_name`
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/venues failed:", err);
    return Response.json({ error: "Could not load venues." }, { status: 500 });
  }
}