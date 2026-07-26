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

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authReady, explicitLogin } = useAuth();
  // usePwaInstall is now mounted at the app root so PWA status is tracked globally,
  // not just on the Profile page. It also detects uninstalls via getInstalledRelatedApps.
  const { isInstalled: isPwaInstalled } = usePwaInstall();
  const [step, setStep] = useState<OnboardingStep>("NONE");

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

    // Step B: Welcome / Auth modal ("Already a Sikkanam User?")
    // Check both storages — sessionStorage for current session dismissal,
    // localStorage is cleared by purgeStaleSession on logout/auto-signout.
    const authDismissed =
      localStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true" ||
      sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isAuthenticatedUser = Boolean(user && explicitLogin);
    if (!isAuthenticatedUser && !authDismissed) {
      setStep("WELCOME_AUTH");
      return;
    }

    // Step C: Install PWA
    // isPwaInstalled comes from the usePwaInstall hook which checks:
    // - standalone display mode (running as installed app)
    // - localStorage flag
    // - navigator.getInstalledRelatedApps() (detects uninstalls)
    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";
    if (!isPwaInstalled && !pwaDismissed) {
      setStep("INSTALL_PWA");
      return;
    }

    setStep("NONE");
  }, [authReady, user, explicitLogin, isPwaInstalled, step]);

  const dismissWhatsNew = () => {
    try {
      localStorage.setItem(VERSION_KEY, VERSION);
      const seconds = 365 * 24 * 60 * 60;
      document.cookie = `${VERSION_KEY}=${encodeURIComponent(VERSION)}; max-age=${seconds}; path=/; SameSite=Lax`;
    } catch (e) {}

    const authDismissed =
      localStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true" ||
      sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY) === "true";
    const isAuthenticatedUser = Boolean(user && explicitLogin);
    const pwaDismissed = sessionStorage.getItem(PWA_DISMISSED_SESSION_KEY) === "true";

    if (!isAuthenticatedUser && !authDismissed) {
      setStep("WELCOME_AUTH");
    } else if (!isPwaInstalled && !pwaDismissed) {
      setStep("INSTALL_PWA");
    } else {
      setStep("NONE");
    }
  };

  const dismissWelcomeAuth = () => {
    try {
      localStorage.setItem(WELCOME_AUTH_SESSION_KEY, "true");
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
