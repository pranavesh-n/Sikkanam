/**
 * PWA Utility Functions
 * Centralizes standalone display mode and installation checks across Sikkanam.
 */

export const checkIsRunningStandalone = (): boolean => {
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
