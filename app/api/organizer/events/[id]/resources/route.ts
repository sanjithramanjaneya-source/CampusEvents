import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { loadManagedEvent } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

// All resources, how many are free, and how many this event holds.
export async function GET(_request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.resource_id, r.resource_name, r.resource_type,
              r.total_quantity, r.available_quantity,
              COALESCE(ra.quantity, 0) AS allocated
         FROM resources r
         LEFT JOIN resource_allocations ra
                ON ra.resource_id = r.resource_id AND ra.event_id = ?
        ORDER BY r.resource_type, r.resource_name`,
      [managed.event.event_id]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET resources failed:", err);
    return Response.json({ error: "Could not load resources." }, { status: 500 });
  }
}

// Set how many of a resource this event needs. Body: { resource_id, quantity }
// (0 removes it). Stock checks and updates are done by triggers in MySQL.
export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  const body = await request.json().catch(() => ({}));
  const resourceId = Number(body.resource_id);
  const quantity = Number(body.quantity);
  if (
    !Number.isInteger(resourceId) || resourceId < 1 ||
    !Number.isInteger(quantity) || quantity < 0
  ) {
    return Response.json({ error: "Enter a whole number, 0 or more." }, { status: 400 });
  }

  try {
    await pool.query("CALL SetEventResource(?, ?, ?, ?, ?)", [
      managed.event.event_id,
      resourceId,
      quantity,
      auth.user.user_id,
      auth.user.role === "ADMIN" ? 1 : 0,
    ]);
    return Response.json({ message: "Resources updated." });
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string; code?: string };
    if (e.sqlState === "45000") {
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    if (e.code === "ER_CHECK_CONSTRAINT_VIOLATED") {
      return Response.json({ error: "Not enough stock available." }, { status: 400 });
    }
    console.error("SetEventResource failed:", err);
    return Response.json({ error: "Could not update resources." }, { status: 500 });
  }
}