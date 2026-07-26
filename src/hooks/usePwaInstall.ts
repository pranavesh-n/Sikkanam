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
      // Immediate check: running as PWA (standalone) or previously installed (localStorage flag)
      if (checkIsStandalone()) return true;
      return localStorage.getItem(INSTALLED_KEY) === "true";
    } catch (e) {
      return false;
    }
  });

  // True when Chrome has fired beforeinstallprompt — meaning the app is currently
  // installable (not running as an installed PWA). Used to bypass long-term dismissal
  // flags when the user has uninstalled the app and revisits in the browser.
  const [pwaInstallAvailable, setPwaInstallAvailable] = useState(false);

  useEffect(() => {
    // ── SIGNAL 1: appinstalled ──────────────────────────────────────────────
    // Fired when the user successfully installs the PWA via browser prompt.
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
      } catch (e) {}
      setIsInstalled(true);
    };

    // ── SIGNAL 2: beforeinstallprompt ───────────────────────────────────────
    // Captures the install prompt for the Install button to use later.
    // NOTE: Chrome can fire this event even when the PWA is already installed
    // on some desktop builds. Therefore we DO NOT use it as an "installed" status
    // indicator. The localStorage flag is the source of truth.
    // Only mark as not installed if there is no existing localStorage flag.
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      // Signal that the app is currently installable (Chrome confirmed it is NOT running as installed PWA)
      setPwaInstallAvailable(true);
      // Only update install state if we have no prior installation record.
      // If localStorage says installed, trust it — don't override with this event.
      try {
        if (localStorage.getItem(INSTALLED_KEY) !== "true" && !checkIsStandalone()) {
          setIsInstalled(false);
        }
      } catch (e) {}
    };

    // ── SIGNAL 3: display-mode change ──────────────────────────────────────
    // Fires when the user switches to standalone mode (opened from home screen).
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
