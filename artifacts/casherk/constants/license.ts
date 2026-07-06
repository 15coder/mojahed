import forge from 'node-forge';

// ═══════════════════════════════════════════════════════════════════════
//  السر الخاص — يجب أن يكون نفسه في لوحة التحكم
//  غيّره لأي نص سري تريده قبل توزيع التطبيق
//  لا تشاركه مع أحد — من يعرفه يستطيع توليد مفاتيح بنفسه
// ═══════════════════════════════════════════════════════════════════════
const LICENSE_SALT = 'CK-7x9mR2nQs-SALT-5wY3hZ8jBuT4eA';

/**
 * يولّد مفتاح التفعيل من رمز الجهاز
 * المخرج: XXXX-XXXX-XXXX (12 حرف hex بتنسيق 3 مجموعات)
 */
export function generateLicenseKey(deviceId: string): string {
  const hmac = forge.hmac.create();
  hmac.start('sha256', LICENSE_SALT);
  hmac.update(deviceId.toLowerCase().trim());
  const hex = hmac.digest().toHex();
  const raw = hex.slice(0, 12).toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/**
 * يتحقق من صحة مفتاح التفعيل مقابل رمز الجهاز
 */
export function verifyLicenseKey(deviceId: string, key: string): boolean {
  try {
    const expected = generateLicenseKey(deviceId);
    return key.toUpperCase().replace(/\s/g, '') === expected;
  } catch {
    return false;
  }
}
