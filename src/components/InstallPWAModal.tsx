import { useState, useEffect } from "react";
import { X, Smartphone, Zap, ShieldCheck, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = "sikkanam_pwa_dismissed_v1";

const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
};

const setCookie = (name: string, value: string, days: number = 30) => {
  try {
    const seconds = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn("Failed to set cookie:", e);
  }
};

export default function InstallPWAModal() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Check if already running as installed PWA (Standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // Already installed!
    }

    // 2. Check if user recently dismissed prompt
    try {
      const dismissedLocal = localStorage.getItem(STORAGE_KEY);
      const dismissedCookie = getCookie(STORAGE_KEY);
      if (dismissedLocal === "true" || dismissedCookie === "true") {
        return;
      }
    } catch (e) {
      console.warn("Storage check failed", e);
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      // Show prompt on iOS after a brief delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // 4. Listen for beforeinstallprompt on Chromium/Android/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show modal after 3 seconds so user gets a smooth initial landing experience
      setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      setCookie(STORAGE_KEY, "true", 30);
    } catch (e) {
      console.warn("Failed to set dismissal", e);
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback: If no deferred prompt event available, prompt browser default
      alert("To install, tap your browser's menu (⋮ or share icon) and select 'Add to Home Screen' or 'Install App'.");
      handleDismiss();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the PWA install prompt");
      }
      setDeferredPrompt(null);
      handleDismiss();
    } catch (err) {
      console.error("Install prompt error:", err);
      handleDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
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
                // Fallback text logo if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-white text-2xl font-bold font-serif hidden">S</span>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Install Sikkanam
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Add to your home screen
          </p>

          {/* Benefits List */}
          {!showIOSInstructions ? (
            <div className="w-full space-y-3.5 text-left mb-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">Opens instantly</span> — no browser, no tabs
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">Faster loads</span> with offline travel caching
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold text-slate-900 dark:text-white">Same app, same data</span> — seamless experience
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
