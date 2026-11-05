import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Numbers, charts data and recent activity for the admin dashboard.
export async function GET() {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  try {
    const [stats, byStatus, topEvents, calendar, activity] = await Promise.all([
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
      // CTE + window function: rank events by registrations
      pool.query<RowDataPacket[]>(
        `WITH event_counts AS (
           SELECT e.event_id, e.event_name, e.expected_attendees AS capacity,
                  COUNT(r.registration_id) AS registrations
             FROM events e
             LEFT JOIN registrations r
                    ON r.event_id = e.event_id
                   AND r.status IN ('REGISTERED', 'ATTENDED')
            GROUP BY e.event_id, e.event_name, e.expected_attendees
         )
         SELECT event_id, event_name, capacity, registrations,
                RANK() OVER (ORDER BY registrations DESC) AS popularity_rank
           FROM event_counts
          WHERE registrations > 0
          ORDER BY popularity_rank, event_name
          LIMIT 5`
      ),
      // Recursive CTE: build the next 14 days, then count live events per day
      pool.query<RowDataPacket[]>(
        `WITH RECURSIVE days AS (
           SELECT CURDATE() AS cal_date
           UNION ALL
           SELECT cal_date + INTERVAL 1 DAY
             FROM days
            WHERE cal_date < CURDATE() + INTERVAL 13 DAY
         )
         SELECT DATE_FORMAT(d.cal_date, '%Y-%m-%d') AS cal_date,
                COUNT(e.event_id) AS events
           FROM days d
           LEFT JOIN events e
                  ON e.status IN ('APPROVED', 'ONGOING')
                 AND DATE(e.start_time) <= d.cal_date
                 AND DATE(e.end_time) >= d.cal_date
          GROUP BY d.cal_date
          ORDER BY d.cal_date`
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
      calendar: calendar[0],
      recent_activity: activity[0],
    });
  } catch (err) {
    console.error("GET /api/admin/overview failed:", err);
    return Response.json({ error: "Could not load the overview." }, { status: 500 });
  }
}