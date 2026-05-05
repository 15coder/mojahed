import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { checkLicenseStatus } from '@/utils/licenseManager';

interface LicenseContextValue {
  isActivated: boolean;
  isChecking: boolean;
  recheck: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextValue | null>(null);

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [isActivated, setIsActivated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const recheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const ok = await checkLicenseStatus();
      setIsActivated(ok);
    } catch {
      setIsActivated(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    recheck();
  }, [recheck]);

  return (
    <LicenseContext.Provider value={{ isActivated, isChecking, recheck }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used within LicenseProvider');
  return ctx;
}
