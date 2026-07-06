import { Router } from "express";
import { db } from "@workspace/db";
import { licensesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/licenses/activate
// Body: { deviceId, activationKey }
router.post("/licenses/activate", async (req, res) => {
  const { deviceId, activationKey } = req.body ?? {};

  if (!deviceId || !activationKey) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.activationKey, activationKey.trim().toUpperCase()))
      .limit(1);

    if (!rows.length) {
      res.status(401).json({ error: "invalid_key" });
      return;
    }

    const lic = rows[0];

    if (lic.deviceId !== deviceId) {
      res.status(401).json({ error: "device_mismatch" });
      return;
    }

    if (!lic.isActive || lic.revokedAt) {
      res.status(403).json({ error: "revoked" });
      return;
    }

    if (new Date() > lic.expiresAt) {
      res.status(403).json({ error: "expired" });
      return;
    }

    res.json({ token: lic.licenseToken, expiresAt: lic.expiresAt });
  } catch (err) {
    res.status(500).json({ error: "server_error" });
  }
});

// POST /api/licenses/verify
// Body: { deviceId, token }
router.post("/licenses/verify", async (req, res) => {
  const { deviceId, token } = req.body ?? {};

  if (!deviceId || !token) {
    res.json({ valid: false, reason: "missing_fields" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.deviceId, deviceId))
      .limit(1);

    if (!rows.length) {
      res.json({ valid: false, reason: "not_found" });
      return;
    }

    const lic = rows[0];

    if (lic.licenseToken !== token) {
      res.json({ valid: false, reason: "invalid_token" });
      return;
    }

    if (!lic.isActive || lic.revokedAt) {
      res.json({ valid: false, reason: "revoked" });
      return;
    }

    if (new Date() > lic.expiresAt) {
      res.json({ valid: false, reason: "expired" });
      return;
    }

    res.json({ valid: true, expiresAt: lic.expiresAt });
  } catch {
    res.status(500).json({ valid: false, reason: "server_error" });
  }
});

export default router;
