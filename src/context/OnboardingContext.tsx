import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const { user, authReady, explicitLogin } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("NONE");
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // 1. Wait until Auth Bootstrap has completely initialized and purged stale sessions
    if (!authReady) return;

    // 2. Strict Step Guard: If a modal is currently open on screen, DO NOT auto-dismiss it
    if (step !== "NONE") return;

    // 3. Run initialization logic exactly once per session
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Determine starting step
    const seenLocal = localStorage.getItem(VERSION_KEY);
    const seenCookie = getCookie(VERSION_KEY);
    const hasSeenWhatsNew = seenLocal === VERSION || seenCookie === VERSION;

    if (!hasSeenWhatsNew) {
      setStep("WHATS_NEW");
      return;
    }

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isAuthenticatedUser = Boolean(user && explicitLogin);

    // WelcomeAuthModal appears for unauthenticated visits until explicitly signed in or dismissed as Guest
    if (!isAuthenticatedUser && !authDismissed) {
      setStep("WELCOME_AUTH");
      return;
    }

    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isAlreadyInstalled() && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  }, [authReady, user, explicitLogin, step]);

  const dismissWhatsNew = () => {
    try {
      localStorage.setItem(VERSION_KEY, VERSION);
      const seconds = 365 * 24 * 60 * 60;
      document.cookie = `${VERSION_KEY}=${encodeURIComponent(VERSION)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {}

    const authDismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isAuthenticatedUser = Boolean(user && explicitLogin);
    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";

    if (!isAuthenticatedUser && !authDismissed) {
      setStep("WELCOME_AUTH");
    } else if (!checkIsStandalone() && !pwaDismissed) {
      setStep("INSTALL_PWA");
    } else {
      setStep("NONE");
    }
  };

  const dismissWelcomeAuth = () => {
    try {
      sessionStorage.setItem(WELCOME_AUTH_SESSION_KEY, "true");
    } catch (e) {}

    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!checkIsStandalone() && !pwaDismissed) {
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
