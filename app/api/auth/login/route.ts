import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    // Compare the typed password with the stored scrambled one.
    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !ok) {
      // Same message for both cases, so attackers can't tell which emails exist.
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createSession(user.user_id);

    return Response.json({
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}