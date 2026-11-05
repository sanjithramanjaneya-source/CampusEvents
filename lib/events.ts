import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

export type ManagedEvent = {
  event_id: number;
  organizer_id: number;
  status: string;
  start_time: string;
  end_time: string;
  event_name: string;
};

// Loads an event and checks that this user may manage it (its organizer, or an admin).
export async function loadManagedEvent(rawId: string, user: SessionUser) {
  const eventId = Number(rawId);
  if (!Number.isInteger(eventId) || eventId < 1) {
    return {
      error: Response.json({ error: "Invalid event id." }, { status: 400 }),
    } as const;
  }
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT event_id, organizer_id, status, start_time, end_time, event_name
       FROM events WHERE event_id = ?`,
    [eventId]
  );
  const event = rows[0] as ManagedEvent | undefined;
  if (!event) {
    return {
      error: Response.json({ error: "Event not found." }, { status: 404 }),
    } as const;
  }
  if (user.role !== "ADMIN" && event.organizer_id !== user.user_id) {
    return {
      error: Response.json(
        { error: "You can only manage your own events." },
        { status: 403 }
      ),
    } as const;
  }
  return { event } as const;
}