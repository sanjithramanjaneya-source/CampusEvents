import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const srn = String(body.srn ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    if (!name || !email || !srn || password.length < 6) {
      return Response.json(
        { error: "Fill all fields. Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Scramble the password: only this scrambled version is stored.
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (full_name, email, srn, password_hash, role) VALUES (?, ?, ?, ?, 'STUDENT')",
      [name, email, srn, passwordHash]
    );

    return Response.json({ message: "Account created" }, { status: 201 });
  } catch (err) {
    const e = err as { code?: string; message: string };
    if (e.code === "ER_DUP_ENTRY") {
      const field = e.message.includes("users.srn") ? "SRN" : "Email";
      return Response.json(
        { error: `${field} is already registered.` },
        { status: 409 }
      );
    }
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}