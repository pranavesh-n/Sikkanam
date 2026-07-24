import React, { createContext, useContext, useState, useEffect } from "react";
import { hashPin } from "@/lib/passcode";
import { toast } from "sonner";

interface AppLockContextType {
  isLockEnabled: boolean;
  isLocked: boolean;
  failedAttempts: number;
  setupPasscode: (pin: string) => Promise<boolean>;
  verifyPasscode: (pin: string) => Promise<boolean>;
  disableAppLock: () => void;
  lockApp: () => void;
  unlockApp: () => void;
  resetAppLock: () => void;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

const LOCAL_STORAGE_ENABLED = "sikkanam_applock_enabled";
const LOCAL_STORAGE_PIN = "sikkanam_applock_pin";
const LOCAL_STORAGE_FAILED = "sikkanam_applock_failed_attempts";
const LOCAL_STORAGE_LEAVE_TIME = "sikkanam_applock_leave_time";

// Lock timeout when leaving/backgrounding app: 35 seconds
const BACKGROUND_LOCK_TIMEOUT_MS = 35 * 1000;

export const AppLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLockEnabled, setIsLockEnabled] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ENABLED) === "true";
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_ENABLED) === "true";
  });

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_FAILED);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ENABLED, isLockEnabled ? "true" : "false");
  }, [isLockEnabled]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FAILED, failedAttempts.toString());
  }, [failedAttempts]);

  // Standard Security Architecture: Lock ONLY when leaving app / switching tabs for >= 35s or re-opening
  useEffect(() => {
    if (!isLockEnabled) return;

    const recordLeaveTime = () => {
      localStorage.setItem(LOCAL_STORAGE_LEAVE_TIME, Date.now().toString());
    };

    const checkReturnTime = () => {
      const leaveTimeStr = localStorage.getItem(LOCAL_STORAGE_LEAVE_TIME);
      if (leaveTimeStr) {
        const leaveTime = parseInt(leaveTimeStr, 10);
        const elapsed = Date.now() - leaveTime;
        if (elapsed >= BACKGROUND_LOCK_TIMEOUT_MS) {
          setIsLocked(true);
        }
        localStorage.removeItem(LOCAL_STORAGE_LEAVE_TIME);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordLeaveTime();
      } else if (document.visibilityState === "visible") {
        checkReturnTime();
      }
    };

    const handlePageHide = () => {
      recordLeaveTime();
    };

    const handleFocus = () => {
      checkReturnTime();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLockEnabled]);

  const setupPasscode = async (pin: string): Promise<boolean> => {
    if (pin.length !== 4) return false;
    try {
      const hashed = await hashPin(pin);
      localStorage.setItem(LOCAL_STORAGE_PIN, hashed);
      setIsLockEnabled(true);
      setIsLocked(false);
      setFailedAttempts(0);
      toast.success("App Lock enabled successfully!");
      return true;
    } catch (err) {
      toast.error("Failed to set PIN code");
      return false;
    }
  };

  const verifyPasscode = async (pin: string): Promise<boolean> => {
    const savedHash = localStorage.getItem(LOCAL_STORAGE_PIN);
    if (!savedHash) return false;

    const inputHash = await hashPin(pin);
    if (inputHash === savedHash) {
      setIsLocked(false);
      setFailedAttempts(0);
      localStorage.removeItem(LOCAL_STORAGE_LEAVE_TIME);
      return true;
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      return false;
    }
  };

  const disableAppLock = () => {
    localStorage.removeItem(LOCAL_STORAGE_LEAVE_TIME);
    localStorage.removeItem(LOCAL_STORAGE_PIN);
    localStorage.setItem(LOCAL_STORAGE_ENABLED, "false");
    setIsLockEnabled(false);
    setIsLocked(false);
    setFailedAttempts(0);
    toast.info("App Lock has been disabled");
  };

  const lockApp = () => {
    if (isLockEnabled) {
      setIsLocked(true);
    }
  };

  const unlockApp = () => {
    setIsLocked(false);
    setFailedAttempts(0);
    localStorage.removeItem(LOCAL_STORAGE_LEAVE_TIME);
  };

  const resetAppLock = () => {
    localStorage.removeItem(LOCAL_STORAGE_LEAVE_TIME);
    localStorage.removeItem(LOCAL_STORAGE_PIN);
    localStorage.setItem(LOCAL_STORAGE_ENABLED, "false");
    setIsLockEnabled(false);
    setIsLocked(false);
    setFailedAttempts(0);
    toast.success("App Lock has been reset");
  };

  return (
    <AppLockContext.Provider
      value={{
        isLockEnabled,
        isLocked,
        failedAttempts,
        setupPasscode,
        verifyPasscode,
        disableAppLock,
        lockApp,
        unlockApp,
        resetAppLock,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = () => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error("useAppLock must be used within an AppLockProvider");
  }
  return context;
};
