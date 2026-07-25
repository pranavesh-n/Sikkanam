import { useState, useEffect } from "react";
import { X, Smartphone, Zap, ShieldCheck, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const SESSION_KEY = "sikkanam_pwa_dismissed_session";
const INSTALLED_KEY = "sikkanam_pwa_installed";

export default function InstallPWAModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (window as any).deferredPwaPrompt || null;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const checkIsStandalone = () => {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://")
    );
  };

  const isAlreadyInstalled = () => {
    try {
      if (localStorage.getItem(INSTALLED_KEY) === "true") return true;
    } catch (e) {}
    return checkIsStandalone();
  };

  useEffect(() => {
    if (isAlreadyInstalled()) return;

    // Check if dismissed in current session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    } catch (e) {}

    // Check window.deferredPwaPrompt
    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as any).deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      try {
        const dismissed = sessionStorage.getItem(SESSION_KEY);
        if (!dismissed && !isAlreadyInstalled()) {
          setTimeout(() => setIsOpen(true), 2000);
        }
      } catch (e) {}
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      try {
        const dismissed = sessionStorage.getItem(SESSION_KEY);
        if (!dismissed && !isAlreadyInstalled()) {
          setTimeout(() => setIsOpen(true), 3000);
        }
      } catch (e) {}
    }

    // Fallback trigger for Chrome/Android
    const fallbackTimer = setTimeout(() => {
      try {
        const dismissed = sessionStorage.getItem(SESSION_KEY);
        if (!dismissed && !isAlreadyInstalled()) {
          setIsOpen(true);
        }
      } catch (e) {}
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch (e) {
      console.warn("Failed to save dismissal in sessionStorage", e);
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;

    if (!activePrompt) {
      alert("To install, tap your browser menu (⋮ or share icon) and select 'Add to Home Screen' or 'Install App'.");
      handleDismiss();
      return;
    }

    try {
      await activePrompt.prompt();
      const choiceResult = await activePrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        try {
          localStorage.setItem(INSTALLED_KEY, "true");
        } catch (e) {}
      }
      setDeferredPrompt(null);
      (window as any).deferredPwaPrompt = null;
      handleDismiss();
    } catch (err) {
      console.error("Install prompt error:", err);
      handleDismiss();
    }
  };

  if (!isOpen || isAlreadyInstalled()) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all transform scale-100">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* App Logo Badge */}
          <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Sikkanam Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Install Sikkanam App
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Add to your home screen for 1-tap fast access
          </p>

          {/* Benefits List */}
          {!showIOSInstructions ? (
            <div className="w-full space-y-3.5 text-left mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">1-Tap Access</span> — Opens directly from home screen
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">Full-Screen Display</span> — Zero address bar or extra browser tabs
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">Real-Time Cloud Sync</span> — Instant travel & passcode sync
                </div>
              </div>
            </div>
          ) : (
            /* iOS Specific Instructions */
            <div className="w-full text-left mb-6 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50 space-y-3">
              <p className="text-xs sm:text-sm text-orange-900 dark:text-orange-200 font-medium">
                To install on iOS:
              </p>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold text-orange-600">1.</span>
                <span>Tap the <Share className="w-4 h-4 inline text-orange-600 mx-1" /> <strong>Share</strong> button in Safari toolbar.</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold text-orange-600">2.</span>
                <span>Scroll down and select <PlusSquare className="w-4 h-4 inline text-orange-600 mx-1" /> <strong>Add to Home Screen</strong>.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full space-y-2.5">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <span>{showIOSInstructions ? "Got it" : "Install App"}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
