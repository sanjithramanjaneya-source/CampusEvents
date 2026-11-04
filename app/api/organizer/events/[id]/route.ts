import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

async function run(procedure: "CancelEvent" | "DeleteEvent", ctx: Ctx, done: string) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return Response.json({ error: "Invalid event id." }, { status: 400 });
  }

  try {
    await pool.query(`CALL ${procedure}(?, ?, ?)`, [
      eventId,
      auth.user.user_id,
      auth.user.role === "ADMIN" ? 1 : 0,
    ]);
    return Response.json({ message: done });
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string };
    if (e.sqlState === "45000") {
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    console.error(`${procedure} failed:`, err);
    return Response.json({ error: "Action failed." }, { status: 500 });
  }
}

// Cancel an event (resources go back to the store).
export async function PATCH(_request: Request, ctx: Ctx) {
  return run("CancelEvent", ctx, "Event cancelled.");
}

// Delete a pending or cancelled event.
export async function DELETE(_request: Request, ctx: Ctx) {
  return run("DeleteEvent", ctx, "Event deleted.");
}