#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 *  كاشيرك — مولّد تراخيص الأجهزة (RSA-2048 / SHA-256)
 *  Casherk Device License Generator
 * ═══════════════════════════════════════════════════════════════
 *
 * الاستخدام:
 *   node tools/keygen-license.js <device-id>
 *
 * مثال:
 *   node tools/keygen-license.js a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *
 * آلية العمل:
 *   يوقّع المفتاح الخاص (RSA-2048) على Device ID بتجزئة SHA-256
 *   ينتج توقيعاً Base64 يتحقق منه التطبيق بالمفتاح العام المضمّن فيه
 *   ⚠  المفتاح الخاص أدناه هو سرك الوحيد — لا تشاركه مع أحد
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';
const crypto = require('crypto');

// ─── المفتاح الخاص — احتفظ بهذا الملف سراً ──────────────────────────────
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCgXvt2qKKl3iH5
3CztSvKcq1w5AWbsR5g4JefpA4oqmAddNPRCKTosH6a8lsrZRfxR+cz9jRAIc0b/
yVUVms0ap/K7u44TDVEGD8vD6XWEYzR0o2GHxJx8kHy+ZaSP7cKd8PAlKhCsI8mq
aoDc1e85CouE82g/mJ3QId+skPKdnMCUW0vy6IICaLJC9T2ghce5lPfndRuFCiTw
Ob5W3iR3UfBuCEVUI3e9k860QPXTDyA7eLjHX27oeAjClBbsmQsWocLYCAUK+0rb
TunAOCBspqZGJTrIDlvriEF605wF6gXzGOZgCkxN1ik9aAXCzoFDGqGvzmIFOyQy
IYEDuMSFAgMBAAECggEAA7ZCy8gBnjjrjyxdx7GGQP3HoZtiZKM3SYal2pvJwCUZ
nyaseUpU2NRMkO045fwW3hsvnyxUE0pN7/Aul15ZmGAMB37WoI8wMYgIX/1rrMVm
c0VNdJyS3cLuFmPz5GNqm++60HoEeMZO+jI0Ra01X2DufXrYhGoqri6aiTwAa3V4
6nxJVbqLFHIm6eVmFNWHuVvsgdjhl2AWn7jz7ohbRrUPId9oVFP9bEZI1kVJ2/4V
oBMN6mows7RxTWo7XRXE18giTJg0h2PUJiMhawvbVTMw+58OKT/7HWMoCdqJZQsV
BbLqxlZY4kGIaATaRfeRP73xsI7Jtd1j+ZwfPx1f4QKBgQDNcwUe23AbY/JhwesB
bTltwRgK0U4JJOk1/i5x2lueS57DDwvtNUNABc+V+/ychWUHCjuTTRHzn6RIvBqz
8rEjx04nurOiJG/9/pRtUtTD0b4Ch67oGhz9RJKaYXDE9n0Z7419p2L13E1+41OX
UUcH6FFQ6QPKoCFlu5MiEHNxqwKBgQDH1IqZzFpAJ+mmBQmdp2usTnyPKc5sX6Mx
PHmZHRJDp4qE/xA5X14ANxbA7zXkJctEL+C+d2B66ajYHhNf3ztjaczeIhmE7duA
WoNqJSZ3HgOIbE6pWJOvEFn+oiR/r6TCIfvoJWg42OBIx2GfnBw4qpQbwJVY0Q19
g+/ZXfrSjwKBgQC1pKb3VD43CVPoWIIFneMzhZBTKCDddtP2F8hKgyuTtfolLW13
CStvNHQHgGYkoM/kvIhVwMNJaXDfmefmB4HUR0dzWt+tUJfvsiDa02wnwY5EQGBE
96l/xxvzAImqqt+KicDIQrD8/Q1LTYO/em3ZsO4MIihnAtLkVkZMzMy0xwKBgQCK
zVVgsxNVUOP4j7M4MNyXmQToJG/f0yZ1wr3r3sea+rs62jiYwWd32swRQ5c5XA8u
09rWMfFwLvE6/NkUVOjZitnkyebT8KvxIe36QsfPIafukNyqwH4EseTw/AtCLezR
c+2YOLOGGQ7hPqzOww7PRZ0PEdwrDzrBnm1xnNfmfQKBgQDFFceRfQJVMwfHONEB
Y32rLDZaj02LeJYnYVRFJLfI881EujL0aSpx5af65O/JtMgD59A0fWbZUrWw0fy0
S0LSkji3TyvXlHm/M/wRsxJVS1nJhi6ble8652EYgY139vZUJxfQix3D6tZ7B0bG
l3ys9yixRlWfo96I5uA9ByG5tw==
-----END PRIVATE KEY-----`;
// ─────────────────────────────────────────────────────────────────────────

function generateLicenseKey(deviceId) {
  const sign = crypto.createSign('SHA256');
  sign.update(deviceId.toLowerCase().trim(), 'utf8');
  return sign.sign(PRIVATE_KEY, 'base64');
}

function main() {
  const deviceId = process.argv[2]?.trim();

  if (!deviceId) {
    console.log('\nالاستخدام:');
    console.log('  node tools/keygen-license.js <device-id>\n');
    console.log('مثال:');
    console.log('  node tools/keygen-license.js a1b2c3d4-e5f6-7890-abcd-ef1234567890\n');
    process.exit(1);
  }

  const licenseKey = generateLicenseKey(deviceId);

  console.log('\n═══════════════════════════════════════');
  console.log('  كاشيرك — كود تفعيل الجهاز');
  console.log('═══════════════════════════════════════');
  console.log('\nDevice ID:', deviceId);
  console.log('\nكود التفعيل (انسخه كاملاً):');
  console.log('\n' + licenseKey);
  console.log('\n═══════════════════════════════════════\n');
}

main();
