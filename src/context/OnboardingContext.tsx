import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";

export type OnboardingStep = "WHATS_NEW" | "WELCOME_AUTH" | "INSTALL_PWA" | "NONE";

interface OnboardingContextType {
  step: OnboardingStep;
  dismissWhatsNew: () => void;
  dismissWelcomeAuth: () => void;
  dismissInstallPWA: () => void;
  isOnboardingActive: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const VERSION = "2.4";
const VERSION_KEY = "sikkanam-version";
const WELCOME_AUTH_SESSION_KEY = "sikkanam_welcome_auth_dismissed";
const PWA_DISMISSED_SESSION_KEY = "sikkanam_pwa_dismissed_session";
const INSTALLED_KEY = "sikkanam_pwa_installed";
const APPLOCK_ENABLED_KEY = "sikkanam_applock_enabled";
const APPLOCK_PIN_KEY = "sikkanam_applock_pin";

const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
};

const checkIsStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
};

const isAlreadyInstalled = () => {
  try {
    if (localStorage.getItem(INSTALLED_KEY) === "true") return true;
  } catch (e) {}
  return checkIsStandalone();
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<OnboardingStep>("NONE");

  useEffect(() => {
    // 1. Detect PWA Uninstall / Standalone Mode Loss:
    // If the app was previously installed, but the user is currently in non-standalone browser mode
    try {
      const wasInstalled = localStorage.getItem(INSTALLED_KEY) === "true";
      const standalone = checkIsStandalone();

      if (wasInstalled && !standalone) {
        console.info("PWA uninstall or web browser switch detected. Performing auto-logout.");
        // Sign out Firebase user
        auth.signOut().catch(() => {});
        // Clean stale local storage flags
        localStorage.removeItem(INSTALLED_KEY);
        localStorage.removeItem(APPLOCK_ENABLED_KEY);
        localStorage.removeItem(APPLOCK_PIN_KEY);
        // Reset session flags so fresh onboarding presents cleanly
        sessionStorage.removeItem(WELCOME_AUTH_SESSION_KEY);
        sessionStorage.removeItem(PWA_DISMISSED_SESSION_KEY);
      }
    } catch (err) {
      console.warn("Uninstall check error:", err);
    }

    // 2. Determine initial step
    const seenLocal = localStorage.getItem(VERSION_KEY);
    const seenCookie = getCookie(VERSION_KEY);
    const hasSeenWhatsNew = seenLocal === VERSION || seenCookie === VERSION;

    if (!hasSeenWhatsNew) {
      setStep("WHATS_NEW");
      return;
    }

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isLoggedIn = Boolean(auth.currentUser);

    if (!isLoggedIn && !authDismissed) {
      setStep("WELCOME_AUTH");
      return;
    }

    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isAlreadyInstalled() && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  }, []);

  const dismissWhatsNew = () => {
    try {
      localStorage.setItem(VERSION_KEY, VERSION);
      const seconds = 365 * 24 * 60 * 60;
      document.cookie = `${VERSION_KEY}=${encodeURIComponent(VERSION)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {}

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isLoggedIn = Boolean(auth.currentUser);

    if (!isLoggedIn && !authDismissed) {
      setStep("WELCOME_AUTH");
    } else if (!isAlreadyInstalled() && sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) !== "true") {
      setStep("INSTALL_PWA");
    } else {
      setStep("NONE");
    }
  };

  const dismissWelcomeAuth = () => {
    try {
      sessionStorage.setItem(WELCOME_AUTH_SESSION_KEY, "true");
    } catch (e) {}

    if (!isAlreadyInstalled() && sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) !== "true") {
      setStep("INSTALL_PWA");
    } else {
      setStep("NONE");
    }
  };

  const dismissInstallPWA = () => {
    try {
      sessionStorage.setItem(PWA_DISMISSED_SESSION_KEY, "true");
    } catch (e) {}
    setStep("NONE");
  };

  return (
    <OnboardingContext.Provider
      value={{
        step,
        dismissWhatsNew,
        dismissWelcomeAuth,
        dismissInstallPWA,
        isOnboardingActive: step !== "NONE",
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
