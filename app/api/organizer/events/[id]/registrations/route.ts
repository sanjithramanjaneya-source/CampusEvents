import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { loadManagedEvent } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

// Everyone registered for this event, with their details.
export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.registration_id, u.user_id, u.full_name, u.email, u.srn,
              r.status, r.registered_at
         FROM registrations r
         JOIN users u ON u.user_id = r.user_id
        WHERE r.event_id = ? AND r.status IN ('REGISTERED', 'ATTENDED')
        ORDER BY u.full_name`,
      [managed.event.event_id]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET registrations failed:", err);
    return Response.json({ error: "Could not load registrations." }, { status: 500 });
  }
}

// Mark a student present or absent. Body: { user_id, attended: true | false }
export async function PATCH(request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  const body = await request.json().catch(() => ({}));
  const userId = Number(body.user_id);
  if (!Number.isInteger(userId) || userId < 1 || typeof body.attended !== "boolean") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await pool.query("CALL MarkAttendance(?, ?, ?, ?, ?)", [
      managed.event.event_id,
      userId,
      auth.user.user_id,
      auth.user.role === "ADMIN" ? 1 : 0,
      body.attended ? 1 : 0,
    ]);
    return Response.json({ message: "Attendance updated." });
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string };
    if (e.sqlState === "45000") {
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    console.error("MarkAttendance failed:", err);
    return Response.json({ error: "Could not update attendance." }, { status: 500 });
  }
}