import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePwaInstall } from "@/hooks/usePwaInstall";

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

const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Returns true ONLY if the app is currently RUNNING as an installed PWA
 * (standalone display mode, iOS standalone, or Android app referrer).
 * This is different from isPwaInstalled — a user can have the app installed
 * but still be visiting via a regular browser tab.
 */
const checkIsRunningStandalone = (): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const isStandalone = window.matchMedia
      ? window.matchMedia("(display-mode: standalone)").matches
      : false;
    const isOverlay = window.matchMedia
      ? window.matchMedia("(display-mode: window-controls-overlay)").matches
      : false;
    const isNavStandalone = (navigator as any)?.standalone === true;
    const isAndroidApp = Boolean(
      document.referrer &&
        typeof document.referrer === "string" &&
        document.referrer.includes("android-app://")
    );
    return isStandalone || isOverlay || isNavStandalone || isAndroidApp;
  } catch (e) {
    return false;
  }
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady, explicitLogin } = useAuth();
  // isPwaInstalled = true if the app is installed on device (localStorage flag OR standalone).
  // Used to skip the INSTALL_PWA prompt — no need to ask someone to install what they have.
  const { isInstalled: isPwaInstalled } = usePwaInstall();
  const [step, setStep] = useState<OnboardingStep>("NONE");

  // isRunningStandalone = true ONLY if currently running inside the PWA app shell.
  // Used to skip WELCOME_AUTH — in the app, only PIN AppLock applies.
  // A user can have the app installed but visit via browser — they should still see WELCOME_AUTH.
  const isRunningStandalone = checkIsRunningStandalone();

  // One-time migration cleanup: old code wrote WELCOME_AUTH_SESSION_KEY to localStorage,
  // which permanently suppressed the modal for guest users across all sessions.
  // We now only use sessionStorage for this key, so clear any stale localStorage value.
  useEffect(() => {
    try {
      localStorage.removeItem(WELCOME_AUTH_SESSION_KEY);
    } catch (e) {}
  }, []);

  useEffect(() => {
    // 1. Wait until Auth has fully bootstrapped (including purgeStaleSession completing).
    if (!authReady) return;

    // 2. If a modal is already open, don't auto-advance or dismiss it.
    //    The dismiss handlers will trigger the next step explicitly.
    if (step !== "NONE") return;

    // --- Determine which step should be shown ---

    // Step A: What's New
    const seenLocal = localStorage.getItem(VERSION_KEY);
    const seenCookie = getCookie(VERSION_KEY);
    const hasSeenWhatsNew = seenLocal === VERSION || seenCookie === VERSION;
    if (!hasSeenWhatsNew) {
      setStep("WHATS_NEW");
      return;
    }

    // Step B: "Already a Sikkanam User?" auth modal
    // Guard: running inside the installed PWA → skip (PIN AppLock handles security there).
    // A user who HAS the app installed but visits via browser → still sees this modal
    // because the browser session must be treated as a fresh/untrusted visit for security.
    if (!isRunningStandalone) {
      // Only sessionStorage — dismissal is per-session. localStorage is NOT used here
      // because guest dismissals would permanently suppress the modal across all future sessions.
      const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
      const isAuthenticatedUser = Boolean(user && explicitLogin);
      if (!isAuthenticatedUser && !authDismissed) {
        setStep("WELCOME_AUTH");
        return;
      }
    }

    // Step C: Install PWA prompt
    // Guard: isPwaInstalled = true if app is already on device (localStorage flag OR standalone).
    // Even if they are visiting in browser, if they already have the app installed → skip this.
    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isPwaInstalled && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  }, [authReady, user, explicitLogin, isPwaInstalled, isRunningStandalone, step]);

  const dismissWhatsNew = () => {
    try {
      localStorage.setItem(VERSION_KEY, VERSION);
      const seconds = 365 * 24 * 60 * 60;
      document.cookie = `${VERSION_KEY}=${encodeURIComponent(VERSION)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {}

    if (!isRunningStandalone) {
      const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
      const isAuthenticatedUser = Boolean(user && explicitLogin);
      if (!isAuthenticatedUser && !authDismissed) {
        setStep("WELCOME_AUTH");
        return;
      }
    }

    // Regardless of standalone/browser: if not installed, offer install prompt
    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isPwaInstalled && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  };

  const dismissWelcomeAuth = () => {
    try {
      // Only sessionStorage — not localStorage. Guest dismissal is per-session only.
      // If stored in localStorage, guests would never see the modal again across sessions.
      sessionStorage.setItem(WELCOME_AUTH_SESSION_KEY, "true");
    } catch (e) {}

    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isPwaInstalled && !pwaDismissed) {
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
