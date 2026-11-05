import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const eventId = Number(id);
    if (!Number.isInteger(eventId) || eventId < 1) {
      return Response.json({ error: "Invalid event id." }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         e.event_id, e.event_name, e.description, e.category,
         e.start_time, e.end_time, e.expected_attendees, e.status,
         e.organizer_id, e.registration_deadline,
         v.venue_name, v.location, v.capacity,
         u.full_name AS organizer_name,
         EXISTS(SELECT 1 FROM event_banners b WHERE b.event_id = e.event_id) AS has_banner,
         CountActiveRegistrations(e.event_id) AS registered_count,
         EventCrowdLevel(e.event_id) AS crowd_level
       FROM events e
       JOIN venues v ON e.venue_id = v.venue_id
       JOIN users u ON e.organizer_id = u.user_id
       WHERE e.event_id = ?`,
      [eventId]
    );
    const event = rows[0];
    if (!event) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const user = await getCurrentUser();

    // Pending / cancelled events are visible only to admins and the organizer.
    if (!["APPROVED", "ONGOING", "COMPLETED"].includes(event.status)) {
      const allowed =
        user && (user.role === "ADMIN" || user.user_id === event.organizer_id);
      if (!allowed) {
        return Response.json({ error: "Event not found." }, { status: 404 });
      }
    }

    // Is the logged-in user already registered?
    let myRegistration: string | null = null;
    if (user) {
      const [regs] = await pool.query<RowDataPacket[]>(
        "SELECT status FROM registrations WHERE event_id = ? AND user_id = ?",
        [eventId, user.user_id]
      );
      myRegistration = regs[0]?.status ?? null;
    }

    return Response.json({
      ...event,
      my_registration: myRegistration,
      viewer: user ? { user_id: user.user_id, role: user.role } : null,
    });
  } catch (err) {
    console.error("GET /api/events/[id] failed:", err);
    return Response.json({ error: "Could not load event." }, { status: 500 });
  }
}