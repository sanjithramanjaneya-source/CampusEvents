import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Numbers, charts data and recent activity for the admin dashboard.
export async function GET() {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  try {
    const [stats, byStatus, topEvents, activity] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT
           (SELECT COUNT(*) FROM users WHERE role = 'STUDENT')   AS students,
           (SELECT COUNT(*) FROM users WHERE role = 'ORGANIZER') AS organizers,
           (SELECT COUNT(*) FROM events)                          AS total_events,
           (SELECT COUNT(*) FROM events WHERE status = 'PENDING') AS pending_events,
           (SELECT COUNT(*) FROM registrations
             WHERE status IN ('REGISTERED', 'ATTENDED'))          AS total_registrations`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT status, COUNT(*) AS count
           FROM events
          GROUP BY status
          ORDER BY count DESC`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT e.event_id, e.event_name, e.expected_attendees AS capacity,
                COUNT(r.registration_id) AS registrations
           FROM events e
           JOIN venues v ON e.venue_id = v.venue_id
           LEFT JOIN registrations r
                  ON r.event_id = e.event_id
                 AND r.status IN ('REGISTERED', 'ATTENDED')
          GROUP BY e.event_id, e.event_name, e.expected_attendees
         HAVING COUNT(r.registration_id) > 0
          ORDER BY registrations DESC
          LIMIT 5`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT a.audit_id, a.action_type, a.description, a.action_time,
                u.full_name AS user_name
           FROM audit_log a
           LEFT JOIN users u ON a.user_id = u.user_id
          ORDER BY a.audit_id DESC
          LIMIT 15`
      ),
    ]);

    return Response.json({
      stats: stats[0][0],
      by_status: byStatus[0],
      top_events: topEvents[0],
      recent_activity: activity[0],
    });
  } catch (err) {
    console.error("GET /api/admin/overview failed:", err);
    return Response.json({ error: "Could not load the overview." }, { status: 500 });
  }
}