import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Approve or reject a pending event. Body: { "action": "approve" | "reject" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const eventId = Number(id);
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "").toUpperCase();

  if (!Number.isInteger(eventId) || eventId < 1) {
    return Response.json({ error: "Invalid event id." }, { status: 400 });
  }
  if (action !== "APPROVE" && action !== "REJECT") {
    return Response.json({ error: "Invalid action." }, { status: 400 });
  }

  try {
    await pool.query("CALL ReviewEvent(?, ?, ?)", [
      eventId,
      auth.user.user_id,
      action,
    ]);
    return Response.json({
      message: action === "APPROVE" ? "Event approved." : "Event rejected.",
    });
  } catch (err) {
    const e = err as { sqlState?: string; sqlMessage?: string };
    if (e.sqlState === "45000") {
      return Response.json({ error: e.sqlMessage }, { status: 400 });
    }
    console.error("ReviewEvent failed:", err);
    return Response.json({ error: "Action failed." }, { status: 500 });
  }
}