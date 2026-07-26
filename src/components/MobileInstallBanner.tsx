import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

const SESSION_KEY = "sikkanam_pwa_dismissed_session";
const INSTALLED_KEY = "sikkanam_pwa_installed";

export default function MobileInstallBanner() {
  const { step, dismissInstallPWA } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);

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

  useEffect(() => {
    if (isAlreadyInstalled()) return;

    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    } catch (e) {}

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /mobile|iphone|ipad|ipod|android/.test(userAgent) || window.innerWidth <= 768;

    if (!isMobile) return;

    // Show banner after main modal onboarding step has completed
    if (step === "NONE") {
      setIsVisible(true);
    }
  }, [step]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissInstallPWA();
  };

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") {
          try {
            localStorage.setItem(INSTALLED_KEY, "true");
          } catch (e) {}
        }
        (window as any).deferredPwaPrompt = null;
        handleDismiss();
      } catch (err) {
        handleDismiss();
      }
    } else {
      alert("To install, tap your browser menu (⋮ or Share icon) and select 'Add to Home Screen' or 'Install App'.");
      handleDismiss();
    }
  };

  if (!isVisible || isAlreadyInstalled()) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex-shrink-0 grid place-items-center overflow-hidden shadow-md shadow-orange-500/20">
            <img src="/logo.png" alt="Sikkanam" className="w-8 h-8 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate flex items-center gap-1">
              <span>Sikkanam App</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded font-semibold uppercase">1-Tap</span>
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              Fast 1-tap launch from home screen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
