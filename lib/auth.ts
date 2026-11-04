import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

const COOKIE_NAME = "session_id";
const SESSION_DAYS = 7;

export type SessionUser = {
  user_id: number;
  full_name: string;
  email: string;
  role: "STUDENT" | "ORGANIZER" | "ADMIN";
};

// Called after a successful login: save a session row + set the cookie.
export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex"); // 64 random characters
  await pool.query(
    "INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))",
    [token, userId, SESSION_DAYS]
  );
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser cannot read this cookie
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

// Who is logged in right now? Returns the user, or null.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.user_id, u.full_name, u.email, u.role
       FROM sessions s
       JOIN users u ON u.user_id = s.user_id
      WHERE s.session_id = ? AND s.expires_at > NOW()`,
    [token]
  );
  return (rows[0] as SessionUser) ?? null;
}

// Logout: delete the session row and the cookie.
export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await pool.query("DELETE FROM sessions WHERE session_id = ?", [token]);
  }
  store.delete(COOKIE_NAME);
}



// Use at the top of any API that only certain roles may call.
export async function requireRole(...roles: SessionUser["role"][]) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: Response.json({ error: "Please log in." }, { status: 401 }),
    } as const;
  }
  if (!roles.includes(user.role)) {
    return {
      error: Response.json(
        { error: "You do not have permission to do this." },
        { status: 403 }
      ),
    } as const;
  }
  return { user } as const;
}