import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';

import { DEFAULT_THEME_ID } from '@/constants/themes';
import { verifyLicenseKey } from '@/constants/license';
import { AppSettings } from '@/types/product';

const SETTINGS_KEY = '@casherk:settings';
const LICENSE_KEY = '@casherk:license'; // { deviceId, key }

interface StoredLicense {
  deviceId: string;
  key: string;
}

function generateSecurityKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function readDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    const id = await Application.getAndroidId();
    return id ?? 'android-unknown';
  }
  if (Platform.OS === 'ios') {
    const id = await Application.getIosIdForVendorAsync();
    return id ?? 'ios-unknown';
  }
  return 'web-preview';
}

const DEFAULT_SETTINGS: AppSettings = {
  exchangeRate: 13000,
  biometricEnabled: false,
  darkMode: 'system',
  themeId: DEFAULT_THEME_ID,
  appName: 'كاشيرك',
  pinEnabled: false,
  pinCode: '',
  securityKey: generateSecurityKey(),
  customerViewMode: false,
  lastBackupDate: undefined,
  autoLockMinutes: 0,
  lowStockThreshold: 5,
  displayCurrency: 'SYP_NEW',
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  isLocked: boolean;
  lock: () => void;
  unlock: (pin?: string) => boolean;
  isLoading: boolean;
  effectiveDarkMode: 'light' | 'dark';
  // Activation (offline, permanent)
  isActivated: boolean;
  deviceId: string | null;
  activateLicense: (key: string) => Promise<{ success: boolean; error?: string }>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [systemColorScheme, setSystemColorScheme] = useState<'light' | 'dark'>('light');

  const backgroundTimeRef = useRef<number | null>(null);
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    loadSettings();
    if (Platform.OS !== 'web') {
      const { Appearance } = require('react-native');
      const scheme = Appearance.getColorScheme();
      setSystemColorScheme(scheme === 'dark' ? 'dark' : 'light');
      const sub = Appearance.addChangeListener(({ colorScheme }: any) => {
        setSystemColorScheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      return () => sub?.remove?.();
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        backgroundTimeRef.current = Date.now();
      } else if (nextState === 'active') {
        const bg = backgroundTimeRef.current;
        if (bg !== null) {
          const elapsedMin = (Date.now() - bg) / 60000;
          const autoLock = settingsRef.current.autoLockMinutes ?? 0;
          const shouldLock =
            autoLock > 0 &&
            elapsedMin >= autoLock &&
            (settingsRef.current.pinEnabled || settingsRef.current.biometricEnabled);
          if (shouldLock) setIsLocked(true);
          backgroundTimeRef.current = null;
        }
      }
    });
    return () => sub.remove();
  }, []);

  async function loadSettings() {
    try {
      // 1. Get device ID
      const id = await readDeviceId();
      setDeviceId(id);
      deviceIdRef.current = id;

      // 2. Load settings + stored license in parallel
      const [stored, licenseRaw] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(LICENSE_KEY),
      ]);

      // 3. Verify stored license offline (permanent — no expiry check)
      if (licenseRaw) {
        const license: StoredLicense = JSON.parse(licenseRaw);
        const valid =
          license.deviceId === id && verifyLicenseKey(id, license.key);
        if (valid) {
          setIsActivated(true);
        } else {
          // Device changed or key tampered — clear and re-ask
          setIsActivated(false);
          await AsyncStorage.removeItem(LICENSE_KEY);
        }
      } else {
        setIsActivated(false);
      }

      // 4. Load app settings
      if (stored) {
        const parsed: AppSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        if (!parsed.securityKey) parsed.securityKey = generateSecurityKey();
        if (!parsed.displayCurrency) parsed.displayCurrency = 'SYP_NEW';
        setSettings(parsed);
        settingsRef.current = parsed;
        if (parsed.pinEnabled && parsed.pinCode && Platform.OS !== 'web') {
          setIsLocked(true);
        } else if (parsed.biometricEnabled && Platform.OS !== 'web') {
          setIsLocked(true);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      settingsRef.current = next;
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);

  const unlock = useCallback((pin?: string): boolean => {
    if (pin !== undefined) {
      const s = settingsRef.current;
      if (s.pinEnabled && s.pinCode && pin !== s.pinCode) return false;
    }
    setIsLocked(false);
    return true;
  }, []);

  /** Verifies key locally — no internet needed — permanent license */
  const activateLicense = useCallback(
    async (key: string): Promise<{ success: boolean; error?: string }> => {
      const id = deviceIdRef.current;
      if (!id) return { success: false, error: 'no_device_id' };

      const valid = verifyLicenseKey(id, key);
      if (!valid) return { success: false, error: 'invalid_key' };

      await AsyncStorage.setItem(
        LICENSE_KEY,
        JSON.stringify({ deviceId: id, key: key.replace(/[\s\n\r]/g, '') }),
      );
      setIsActivated(true);
      return { success: true };
    },
    [],
  );

  const effectiveDarkMode: 'light' | 'dark' =
    settings.darkMode === 'system' ? systemColorScheme : settings.darkMode;

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isLocked,
        lock,
        unlock,
        isLoading,
        effectiveDarkMode,
        isActivated,
        deviceId,
        activateLicense,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
