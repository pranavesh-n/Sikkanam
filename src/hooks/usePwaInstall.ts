import { useState, useEffect } from "react";

const INSTALLED_KEY = "sikkanam_pwa_installed";

const checkIsStandalone = (): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (navigator as any)?.standalone === true ||
      Boolean(document.referrer?.includes("android-app://"))
    );
  } catch (e) {
    return false;
  }
};

export function usePwaInstall() {
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      // Immediate signals: running as PWA or localStorage flag from a previous install
      if (checkIsStandalone()) return true;
      return localStorage.getItem(INSTALLED_KEY) === "true";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // ── SIGNAL 1: appinstalled ──────────────────────────────────────────────
    // Chrome fires this when the user successfully installs the PWA.
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
      } catch (e) {}
      setIsInstalled(true);
    };

    // ── SIGNAL 2: beforeinstallprompt ───────────────────────────────────────
    // Chrome ONLY fires this when the app is installable AND not yet installed.
    // If the app IS already installed, this event will NEVER fire.
    // Therefore it is the most reliable "not installed" signal available.
    // When it fires: clear the localStorage flag and mark as not installed.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Store prompt for later use by the install button
      (window as any).deferredPwaPrompt = e;
      // This event firing is definitive proof the app is NOT installed.
      // Clear any stale localStorage flag (e.g., from a previous install that was uninstalled).
      try {
        localStorage.removeItem(INSTALLED_KEY);
      } catch (e) {}
      setIsInstalled(false);
    };

    // ── SIGNAL 3: display-mode change ──────────────────────────────────────
    // Fires when the user opens the PWA from the home screen.
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        try {
          localStorage.setItem(INSTALLED_KEY, "true");
        } catch (e) {}
        setIsInstalled(true);
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMediaChange);
      }
    };
  }, []);

  const markInstalled = () => {
    try {
      localStorage.setItem(INSTALLED_KEY, "true");
    } catch (e) {}
    setIsInstalled(true);
  };

  const markUninstalled = () => {
    try {
      localStorage.removeItem(INSTALLED_KEY);
    } catch (e) {}
    setIsInstalled(false);
  };

  return { isInstalled, markInstalled, markUninstalled };
}
