import type { ResultSetHeader } from "mysql2";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

async function readEventId(params: Ctx["params"]) {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Register the logged-in user for an event.
export async function POST(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please log in to register." }, { status: 401 });
  }
  const eventId = await readEventId(params);
  if (!eventId) {
    return Response.json({ error: "Invalid event id." }, { status: 400 });
  }

  try {
    // All the rules (open event, capacity, duplicates) live in the stored procedure.
    await pool.query("CALL RegisterForEvent(?, ?)", [eventId, user.user_id]);
    return Response.json({ message: "You are registered!" }, { status: 201 });
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string };
    if (e.sqlState === "45000") {
      // 45000 = a business-rule message we wrote ourselves in the procedure.
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    console.error("POST /api/events/[id]/register failed:", err);
    return Response.json({ error: "Could not register." }, { status: 500 });
  }
}

// Cancel the logged-in user's registration.
export async function DELETE(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please log in." }, { status: 401 });
  }
  const eventId = await readEventId(params);
  if (!eventId) {
    return Response.json({ error: "Invalid event id." }, { status: 400 });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE registrations
          SET status = 'CANCELLED'
        WHERE event_id = ? AND user_id = ? AND status = 'REGISTERED'
          AND event_id IN (SELECT event_id FROM events WHERE start_time > NOW())`,
      [eventId, user.user_id]
    );
    if (result.affectedRows === 0) {
      return Response.json(
        { error: "No cancellable registration found." },
        { status: 404 }
      );
    }
    return Response.json({ message: "Registration cancelled." });
  } catch (err) {
    console.error("DELETE /api/events/[id]/register failed:", err);
    return Response.json({ error: "Could not cancel." }, { status: 500 });
  }
}