import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { loadManagedEvent } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };
const LOCKED = ["COMPLETED", "CANCELLED", "REJECTED"];

// Staff / volunteers assigned to this event.
export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT u.user_id, u.full_name, u.email, u.srn, es.responsibility
         FROM event_staff es
         JOIN users u ON u.user_id = es.user_id
        WHERE es.event_id = ?
        ORDER BY u.full_name`,
      [managed.event.event_id]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET staff failed:", err);
    return Response.json({ error: "Could not load staff." }, { status: 500 });
  }
}

// Add a staff member by email. Body: { email, responsibility }
export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;
  if (LOCKED.includes(managed.event.status)) {
    return Response.json({ error: "This event can no longer be changed." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const responsibility = String(body.responsibility ?? "").trim();
  if (!email || !responsibility || responsibility.length > 100) {
    return Response.json({ error: "Enter an email and a responsibility." }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO event_staff (event_id, user_id, responsibility)
       SELECT ?, user_id, ? FROM users WHERE email = ? AND user_id <> ?`,
      [managed.event.event_id, responsibility, email, managed.event.organizer_id]
    );
    if (result.affectedRows === 0) {
      return Response.json(
        { error: "No registered user has that email (the organizer cannot be added)." },
        { status: 404 }
      );
    }
    return Response.json({ message: "Staff member added." }, { status: 201 });
  } catch (err) {
    const e = err as { code?: string };
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "That person is already assigned." }, { status: 409 });
    }
    console.error("POST staff failed:", err);
    return Response.json({ error: "Could not add staff." }, { status: 500 });
  }
}

// Remove a staff member. Body: { user_id }
export async function DELETE(request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  const body = await request.json().catch(() => ({}));
  const userId = Number(body.user_id);
  if (!Number.isInteger(userId) || userId < 1) {
    return Response.json({ error: "Invalid user." }, { status: 400 });
  }
  await pool.query("DELETE FROM event_staff WHERE event_id = ? AND user_id = ?", [
    managed.event.event_id,
    userId,
  ]);
  return Response.json({ message: "Staff member removed." });
}