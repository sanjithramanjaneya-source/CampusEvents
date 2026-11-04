import type { ResultSetHeader } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// Change a user's role. Body: { "role": "STUDENT" | "ORGANIZER" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const userId = Number(id);
  const body = await request.json().catch(() => ({}));
  const role = String(body.role ?? "");

  if (!Number.isInteger(userId) || userId < 1) {
    return Response.json({ error: "Invalid user id." }, { status: 400 });
  }
  if (role !== "STUDENT" && role !== "ORGANIZER") {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }
  if (userId === auth.user.user_id) {
    return Response.json({ error: "You cannot change your own role." }, { status: 400 });
  }

  try {
    // Admins can never be changed here, only students and organizers.
    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE users SET role = ? WHERE user_id = ? AND role IN ('STUDENT', 'ORGANIZER')",
      [role, userId]
    );
    if (result.affectedRows === 0) {
      return Response.json(
        { error: "User not found or cannot be changed." },
        { status: 404 }
      );
    }
    return Response.json({ message: "Role updated." });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] failed:", err);
    return Response.json({ error: "Could not update the role." }, { status: 500 });
  }
}