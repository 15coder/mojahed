import forge from 'node-forge';

// ═══════════════════════════════════════════════════════════════════════
//  المفتاح العام فقط — آمن للتضمين في التطبيق
//  المفتاح الخاص موجود في tools/keygen-license.js (عند المطوّر فقط)
//  النظام: RSA-2048 + SHA-256 — لا يمكن توليد مفاتيح بدون المفتاح الخاص
// ═══════════════════════════════════════════════════════════════════════
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoF77dqiipd4h+dws7Ury
nKtcOQFm7EeYOCXn6QOKKpgHXTT0Qik6LB+mvJbK2UX8UfnM/Y0QCHNG/8lVFZrN
Gqfyu7uOEw1RBg/Lw+l1hGM0dKNhh8ScfJB8vmWkj+3CnfDwJSoQrCPJqmqA3NXv
OQqLhPNoP5id0CHfrJDynZzAlFtL8uiCAmiyQvU9oIXHuZT353UbhQok8Dm+Vt4k
d1HwbghFVCN3vZPOtED10w8gO3i4x19u6HgIwpQW7JkLFqHC2AgFCvtK207pwDgg
bKamRiU6yA5b64hBetOcBeoF8xjmYApMTdYpPWgFws6BQxqhr85iBTskMiGBA7jE
hQIDAQAB
-----END PUBLIC KEY-----`;

/**
 * يتحقق من توقيع الترخيص محلياً بدون إنترنت.
 *
 * keyBase64: التوقيع الصادر عن tools/keygen-license.js — سلسلة Base64
 *
 * الخوارزمية: RSA-2048/SHA-256 PKCS#1 v1.5
 */
export function verifyLicenseKey(deviceId: string, keyBase64: string): boolean {
  try {
    const pubKey = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);
    const md = forge.md.sha256.create();
    md.update(deviceId.toLowerCase().trim(), 'utf8');
    // إزالة أي مسافات أو أسطر جديدة تدخلت عند النسخ
    const cleanKey = keyBase64.replace(/[\s\n\r]/g, '');
    const sigBytes = forge.util.decode64(cleanKey);
    return pubKey.verify(md.digest().bytes(), sigBytes);
  } catch {
    return false;
  }
}
