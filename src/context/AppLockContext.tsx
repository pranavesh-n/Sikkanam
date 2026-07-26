import React, { createContext, useContext, useState, useEffect } from "react";
import { hashPin } from "@/lib/passcode";
import { useAuth } from "@/hooks/useAuth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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

const getUserKey = (u: any) => {
  const activeUser = u || auth.currentUser;
  if (!activeUser) return null;
  const rawKey = activeUser.uid || activeUser.id || activeUser.email || "";
  return String(rawKey).replace(/[.#$/[\]]/g, "_");
};

export const AppLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

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

  // Lock is ONLY active when user is logged in
  const effectiveLockEnabled = Boolean(user && isLockEnabled);
  const effectiveIsLocked = Boolean(user && isLocked);

  // If user logs out, clear lock state
  useEffect(() => {
    if (!user) {
      setIsLocked(false);
    }
  }, [user]);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    if (!activeUser) return;
    const key = getUserKey(activeUser);
    if (!key) return;

    const userSettingsRef = doc(db, "usersettings", key);
    const unsubscribe = onSnapshot(
      userSettingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.appLockEnabled === "boolean") {
            setIsLockEnabled(data.appLockEnabled);
            localStorage.setItem(LOCAL_STORAGE_ENABLED, data.appLockEnabled ? "true" : "false");
            if (data.appLockPinHash) {
              localStorage.setItem(LOCAL_STORAGE_PIN, data.appLockPinHash);
            }
            if (data.appLockEnabled) {
              setIsLocked(true);
            }
          }
        } else {
          setIsLockEnabled(false);
          localStorage.setItem(LOCAL_STORAGE_ENABLED, "false");
        }
      },
      (error) => {
        console.warn("Cloud Firestore sync error:", error);
      }
    );

    return () => unsubscribe();
  }, [activeUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ENABLED, isLockEnabled ? "true" : "false");
  }, [isLockEnabled]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_FAILED, failedAttempts.toString());
  }, [failedAttempts]);

  // Standard Security Architecture: Lock ONLY when user is logged in & leaves app for >= 35s
  useEffect(() => {
    if (!effectiveLockEnabled) return;

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
  }, [effectiveLockEnabled]);

  const setupPasscode = async (pin: string): Promise<boolean> => {
    const currentUserObj = activeUser || auth.currentUser;
    if (!currentUserObj) {
      toast.error("Please sign in with Google first to enable App Lock");
      return false;
    }
    if (pin.length !== 4) return false;
    try {
      const hashed = await hashPin(pin);
      localStorage.setItem(LOCAL_STORAGE_PIN, hashed);
      setIsLockEnabled(true);
      setIsLocked(false);
      setFailedAttempts(0);

      // Real-time Cloud Sync to Cloud Firestore
      const key = getUserKey(currentUserObj);
      if (key) {
        setDoc(
          doc(db, "usersettings", key),
          {
            appLockEnabled: true,
            appLockPinHash: hashed,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn("Cloud Firestore write error:", err));
      }

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

    // Sync deletion to Cloud Firestore
    const currentUserObj = activeUser || auth.currentUser;
    if (currentUserObj) {
      const key = getUserKey(currentUserObj);
      if (key) {
        setDoc(
          doc(db, "usersettings", key),
          {
            appLockEnabled: false,
            appLockPinHash: "",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn("Cloud Firestore delete error:", err));
      }
    }

    toast.info("App Lock has been disabled");
  };

  const lockApp = () => {
    if (effectiveLockEnabled) {
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

    // Sync deletion to Cloud Firestore
    const currentUserObj = activeUser || auth.currentUser;
    if (currentUserObj) {
      const key = getUserKey(currentUserObj);
      if (key) {
        setDoc(
          doc(db, "usersettings", key),
          {
            appLockEnabled: false,
            appLockPinHash: "",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch((err) => console.warn("Cloud Firestore reset error:", err));
      }
    }

    toast.success("App Lock has been reset");
  };

  return (
    <AppLockContext.Provider
      value={{
        isLockEnabled: effectiveLockEnabled,
        isLocked: effectiveIsLocked,
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
