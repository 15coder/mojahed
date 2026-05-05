import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import forge from 'node-forge';

const LICENSE_KEY = '@mujahid:license_v1';

const RSA_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA04FoEM2Qz/G3orFM4Ono
KTgj+LbVtty/l9zXH2X8Z1P+vutlqr8M4cfPs165rNwjmVi2Ern30UFU7qSZPGDK
uIOfVnFP+fv2sf1pPFL8n7PaHyxy56bZxuEauzO4I4eZkxZ0sXo0FGxY5PUAvgpV
uj1bB9lTuAG23Txuw13BAMJvImJLdVbf8nIsA8dM++M0HXYNXsQDEwsmnuvzyPGT
w0biWzsVaxWhCPxiD7uPP16qkiq5YAoAOToZO/bmSokWyG9lOgXcJJomUEyHhpbH
qWZ3tFGBMyvHuFV+wODxxKMf/lqF+03M3GL5rvnR0Nb02sPWxVqhH3fPT1CrLFl3
1QIDAQAB
-----END PUBLIC KEY-----`;

function sha256Hex(input: string): string {
  const md = forge.md.sha256.create();
  md.update(input, 'utf8');
  return md.digest().toHex();
}

export function getHWID(): string {
  let raw = '';
  if (Platform.OS === 'android') {
    raw = Device.osBuildId ?? Device.modelId ?? 'android-unknown';
  } else if (Platform.OS === 'ios') {
    raw = Device.modelId ?? Device.osBuildId ?? 'ios-unknown';
  } else {
    raw = 'web-platform';
  }
  return sha256Hex(raw.trim().toLowerCase());
}

export function getRequestCode(hwid: string): string {
  const short = hwid.substring(0, 20).toUpperCase();
  return short.match(/.{1,4}/g)!.join('-');
}

export function verifyLicense(hwid: string, signatureB64: string): boolean {
  try {
    const cleanSig = signatureB64.replace(/[\s-]/g, '');
    const sigBytes = forge.util.decode64(cleanSig);
    const pubKey = forge.pki.publicKeyFromPem(RSA_PUBLIC_KEY);
    const md = forge.md.sha256.create();
    md.update(hwid, 'utf8');
    return (pubKey as any).verify(md.digest().bytes(), sigBytes);
  } catch {
    return false;
  }
}

export async function saveLicense(signatureB64: string): Promise<void> {
  await AsyncStorage.setItem(LICENSE_KEY, signatureB64);
}

export async function loadStoredLicense(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LICENSE_KEY);
  } catch {
    return null;
  }
}

export async function checkLicenseStatus(): Promise<boolean> {
  const stored = await loadStoredLicense();
  if (!stored) return false;
  const hwid = getHWID();
  return verifyLicense(hwid, stored);
}
