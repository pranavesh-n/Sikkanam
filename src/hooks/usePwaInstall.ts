import { useState, useEffect } from "react";

const INSTALLED_KEY = "sikkanam_pwa_installed";

export function usePwaInstall() {
  const checkIsInstalled = (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true ||
        Boolean(document.referrer && typeof document.referrer === "string" && document.referrer.includes("android-app://"));

      if (isStandalone) return true;
      return localStorage.getItem(INSTALLED_KEY) === "true";
    } catch (e) {
      return false;
    }
  };

  const [isInstalled, setIsInstalled] = useState<boolean>(checkIsInstalled);

  useEffect(() => {
    const handleAppInstalled = () => {
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
      } catch (e) {}
      setIsInstalled(true);
    };

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
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaChange);
    }

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
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
