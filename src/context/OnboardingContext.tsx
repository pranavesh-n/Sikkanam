import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

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
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const isStandalone = window.matchMedia ? window.matchMedia("(display-mode: standalone)").matches : false;
    const isOverlay = window.matchMedia ? window.matchMedia("(display-mode: window-controls-overlay)").matches : false;
    const isNavStandalone = (navigator as any)?.standalone === true;
    const isAndroidApp = Boolean(document.referrer && typeof document.referrer === "string" && document.referrer.includes("android-app://"));
    return isStandalone || isOverlay || isNavStandalone || isAndroidApp;
  } catch (e) {
    return false;
  }
};

const isAlreadyInstalled = () => {
  try {
    if (localStorage.getItem(INSTALLED_KEY) === "true") return true;
  } catch (e) {}
  return checkIsStandalone();
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("NONE");

  useEffect(() => {
    if (loading) return;
    // Once an onboarding step is active, keep it open until explicit user interaction
    if (step !== "NONE") return;

    const standalone = checkIsStandalone();
    const pwaAuthenticated = sessionStorage.getItem("sikkanam_pwa_authenticated") === "true";
    const webAuthenticated = sessionStorage.getItem("sikkanam_web_authenticated") === "true";

    // 1. Fresh PWA App Launch:
    // If user opens the standalone PWA app, but hasn't explicitly signed in inside this app session yet
    if (standalone && !pwaAuthenticated && user) {
      console.info("Fresh PWA standalone launch detected. Signing out stale background session.");
      auth.signOut().catch(() => {});
      localStorage.removeItem(INSTALLED_KEY);
      localStorage.removeItem(APPLOCK_ENABLED_KEY);
      localStorage.removeItem(APPLOCK_PIN_KEY);
      sessionStorage.removeItem(WELCOME_AUTH_SESSION_KEY);
      setStep("WELCOME_AUTH");
      return;
    }

    // 2. Web Browser Switch / Uninstall Return:
    // If user is running in standard web browser after uninstalling PWA, without explicit web login
    if (!standalone && !webAuthenticated && localStorage.getItem(INSTALLED_KEY) === "true" && user) {
      console.info("Uninstalled PWA return detected. Signing out stale background session.");
      auth.signOut().catch(() => {});
      localStorage.removeItem(INSTALLED_KEY);
      localStorage.removeItem(APPLOCK_ENABLED_KEY);
      localStorage.removeItem(APPLOCK_PIN_KEY);
      sessionStorage.removeItem(WELCOME_AUTH_SESSION_KEY);
      setStep("WELCOME_AUTH");
      return;
    }

    // 3. Determine initial step
    const seenLocal = localStorage.getItem(VERSION_KEY);
    const seenCookie = getCookie(VERSION_KEY);
    const hasSeenWhatsNew = seenLocal === VERSION || seenCookie === VERSION;

    if (!hasSeenWhatsNew) {
      setStep("WHATS_NEW");
      return;
    }

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";

    if (!user && !authDismissed) {
      setStep("WELCOME_AUTH");
      return;
    }

    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isAlreadyInstalled() && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  }, [user, loading]);

  const dismissWhatsNew = () => {
    try {
      localStorage.setItem(VERSION_KEY, VERSION);
      const seconds = 365 * 24 * 60 * 60;
      document.cookie = `${VERSION_KEY}=${encodeURIComponent(VERSION)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {}

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";

    if (!user && !authDismissed) {
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
