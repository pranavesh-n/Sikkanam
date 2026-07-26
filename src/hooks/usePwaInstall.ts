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
      if (checkIsStandalone()) return true;
      return localStorage.getItem(INSTALLED_KEY) === "true";
    } catch (e) {
      return false;
    }
  });

  const [pwaInstallAvailable, setPwaInstallAvailable] = useState(false);

  useEffect(() => {
    // ── SIGNAL 1: appinstalled ──────────────────────────────────────────────
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
      } catch (e) {}
      setIsInstalled(true);
    };

    // ── SIGNAL 2: beforeinstallprompt ───────────────────────────────────────
    // Fired when the app is NOT installed (or was uninstalled) and is installable.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      setPwaInstallAvailable(true);
      if (!checkIsStandalone()) {
        try {
          localStorage.removeItem(INSTALLED_KEY);
        } catch (e) {}
        setIsInstalled(false);
      }
    };

    // ── SIGNAL 3: display-mode change ──────────────────────────────────────
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

  return { isInstalled, pwaInstallAvailable, markInstalled, markUninstalled };
}
