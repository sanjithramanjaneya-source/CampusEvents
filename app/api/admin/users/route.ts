import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// List users of one role: /api/admin/users?role=STUDENT or ORGANIZER
export async function GET(request: Request) {
  const auth = await requireRole("ADMIN");
  if ("error" in auth) return auth.error;

  const role = new URL(request.url).searchParams.get("role") ?? "";
  if (role !== "STUDENT" && role !== "ORGANIZER") {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT user_id, full_name, email, srn, role, created_at
         FROM users
        WHERE role = ?
        ORDER BY full_name`,
      [role]
    );
    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/admin/users failed:", err);
    return Response.json({ error: "Could not load users." }, { status: 500 });
  }
}