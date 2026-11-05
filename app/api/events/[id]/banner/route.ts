import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Serves the banner picture of an event.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT b.mime_type, b.image, e.status, e.organizer_id
         FROM event_banners b
         JOIN events e ON e.event_id = b.event_id
        WHERE b.event_id = ?`,
      [eventId]
    );
    const row = rows[0];
    if (!row) return new Response("Not found", { status: 404 });

    // Banners of pending / rejected / cancelled events are private.
    if (!["APPROVED", "ONGOING", "COMPLETED"].includes(row.status)) {
      const user = await getCurrentUser();
      if (!user || (user.role !== "ADMIN" && user.user_id !== row.organizer_id)) {
        return new Response("Not found", { status: 404 });
      }
    }

    return new Response(new Uint8Array(row.image), {
      headers: {
        "Content-Type": row.mime_type,
        "Cache-Control": "private, max-age=30",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("GET banner failed:", err);
    return new Response("Error", { status: 500 });
  }
}