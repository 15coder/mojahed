import { Router, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import { licensesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "node:crypto";

const router = Router();

// ── Admin auth middleware ────────────────────────────────────────────────────
function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.SESSION_SECRET;
  const auth = req.headers.authorization;

  if (!secret || auth !== `Bearer ${secret}`) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateActivationKey(): string {
  // Format: XXXX-XXXX-XXXX (no O/0 or I/1 confusion)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let key = "";
  for (let g = 0; g < 3; g++) {
    if (g > 0) key += "-";
    for (let i = 0; i < 4; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return key;
}

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/admin/licenses  — list all licenses (newest first)
router.get("/admin/licenses", adminAuth, async (_req, res) => {
  try {
    const licenses = await db
      .select()
      .from(licensesTable)
      .orderBy(desc(licensesTable.createdAt));
    res.json(licenses);
  } catch {
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/admin/licenses  — create a new license
// Body: { deviceId, expiresAt (ISO date string), notes? }
router.post("/admin/licenses", adminAuth, async (req, res) => {
  const { deviceId, expiresAt, notes } = req.body ?? {};

  if (!deviceId || !expiresAt) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  try {
    const id = crypto.randomUUID();
    const activationKey = generateActivationKey();
    const licenseToken = crypto.randomUUID();

    const [license] = await db
      .insert(licensesTable)
      .values({
        id,
        deviceId: deviceId.trim(),
        activationKey,
        licenseToken,
        isActive: true,
        expiresAt: new Date(expiresAt),
        notes: notes ?? null,
      })
      .returning();

    res.json(license);
  } catch {
    res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/admin/licenses/:id/revoke  — revoke a license
router.put("/admin/licenses/:id/revoke", adminAuth, async (req, res) => {
  const id = String(req.params.id);
  const { reason } = req.body ?? {};

  try {
    await db
      .update(licensesTable)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason ?? "Revoked by admin",
      })
      .where(eq(licensesTable.id, id));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "server_error" });
  }
});

// PUT /api/admin/licenses/:id/restore  — restore a revoked license
router.put("/admin/licenses/:id/restore", adminAuth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await db
      .update(licensesTable)
      .set({
        isActive: true,
        revokedAt: null,
        revokedReason: null,
      })
      .where(eq(licensesTable.id, id));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "server_error" });
  }
});

// DELETE /api/admin/licenses/:id  — permanently delete
router.delete("/admin/licenses/:id", adminAuth, async (req, res) => {
  const id = String(req.params.id);

  try {
    await db.delete(licensesTable).where(eq(licensesTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
