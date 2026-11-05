import { pool } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { loadManagedEvent } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };
const MAX_BYTES = 2 * 1024 * 1024;

// Check the real file contents, not just the name the browser claims.
function detectType(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length > 8 &&
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    b.length > 12 &&
    b.subarray(0, 4).toString() === "RIFF" &&
    b.subarray(8, 12).toString() === "WEBP"
  )
    return "image/webp";
  return null;
}

const LOCKED = ["COMPLETED", "CANCELLED", "REJECTED"];

// Upload or replace the banner (multipart form field "banner").
export async function POST(request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;
  if (LOCKED.includes(managed.event.status)) {
    return Response.json({ error: "This event can no longer be changed." }, { status: 400 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("banner");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "The image must be smaller than 2 MB." }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectType(buffer);
  if (!mime) {
    return Response.json({ error: "Only JPEG, PNG or WebP images are allowed." }, { status: 400 });
  }

  try {
    await pool.query(
      `INSERT INTO event_banners (event_id, mime_type, image)
       VALUES (?, ?, ?) AS new
       ON DUPLICATE KEY UPDATE mime_type = new.mime_type, image = new.image`,
      [managed.event.event_id, mime, buffer]
    );
    return Response.json({ message: "Banner saved." }, { status: 201 });
  } catch (err) {
    console.error("POST banner failed:", err);
    return Response.json({ error: "Could not save the banner." }, { status: 500 });
  }
}

// Remove the banner.
export async function DELETE(_request: Request, { params }: Ctx) {
  const auth = await requireRole("ORGANIZER", "ADMIN");
  if ("error" in auth) return auth.error;
  const managed = await loadManagedEvent((await params).id, auth.user);
  if ("error" in managed) return managed.error;

  await pool.query("DELETE FROM event_banners WHERE event_id = ?", [managed.event.event_id]);
  return Response.json({ message: "Banner removed." });
}