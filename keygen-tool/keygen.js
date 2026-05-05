#!/usr/bin/env node
/**
 * ================================================
 *  مولّد كود التفعيل — مجاهد للتجارة
 *  Mujahid Trading — License Key Generator (Keygen)
 * ================================================
 *
 * الاستخدام:
 *   node keygen.js <request-code>
 *
 * مثال:
 *   node keygen.js XXXX-XXXX-XXXX-XXXX-XXXX
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PRIVATE_KEY_PATH = path.join(__dirname, 'private.key');

function loadPrivateKey() {
  if (!fs.existsSync(PRIVATE_KEY_PATH)) {
    console.error('❌ ملف private.key غير موجود في نفس مجلد keygen.js');
    console.error('   ضع ملف المفتاح الخاص بجانب هذا الملف واسمه: private.key');
    process.exit(1);
  }
  return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

function cleanRequestCode(code) {
  return code.replace(/[\s-]/g, '').toLowerCase();
}

function generateLicenseKey(privateKeyPem, requestCode) {
  const hwid = cleanRequestCode(requestCode);

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(hwid, 'utf8');
  sign.end();

  const signatureBuffer = sign.sign({ key: privateKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING });
  const b64 = signatureBuffer.toString('base64');

  const grouped = b64.match(/.{1,4}/g).join('-');
  return grouped;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('الاستخدام: node keygen.js <request-code>');
    console.log('مثال:     node keygen.js XXXX-XXXX-XXXX-XXXX-XXXX');
    process.exit(1);
  }

  const requestCode = args[0].trim();
  console.log('\n=== مولّد كود التفعيل — مجاهد للتجارة ===\n');
  console.log('كود الطلب المُدخَل :', requestCode);
  console.log('HWID المُعالَج    :', cleanRequestCode(requestCode));

  const privateKey = loadPrivateKey();
  const licenseKey = generateLicenseKey(privateKey, requestCode);

  console.log('\n✅ كود التفعيل:\n');
  console.log(licenseKey);
  console.log('\n========================================\n');
}

main();
