import { useState, useEffect } from "react";
import { X, Smartphone, Zap, ShieldCheck, Share, PlusSquare } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const INSTALLED_KEY = "sikkanam_pwa_installed";

interface InstallPWAModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function InstallPWAModal({ isOpen: externalIsOpen, onClose }: InstallPWAModalProps = {}) {
  const { step, dismissInstallPWA } = useOnboarding();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    return (window as any).deferredPwaPrompt || null;
  });

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : step === "INSTALL_PWA";

  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

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
    if (isAlreadyInstalled() && externalIsOpen === undefined) return;

    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as any).deferredPwaPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [externalIsOpen]);

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      dismissInstallPWA();
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const activePrompt = deferredPrompt || (window as any).deferredPwaPrompt;

    if (!activePrompt) {
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
      } catch (e) {}
      alert("Sikkanam App is already installed or supported natively!\n\n• On Chrome/Edge Desktop: Tap 'Open in app' at the top right of your address bar.\n• On Mobile: Launch Sikkanam from your home screen.");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-card text-card-foreground rounded-3xl shadow-2xl overflow-hidden border border-border transition-all transform scale-100">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors"
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
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">
            Install Sikkanam App
          </h3>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Add to your home screen for 1-tap fast access
          </p>

          {/* Benefits List */}
          {!showIOSInstructions ? (
            <div className="w-full space-y-3.5 text-left mb-8 bg-muted/40 p-4 rounded-2xl border border-border/50">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-foreground">
                  <span className="font-semibold text-foreground">1-Tap Access</span> — Opens directly from home screen
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-foreground">
                  <span className="font-semibold text-foreground">Full-Screen Display</span> — Zero address bar or extra browser tabs
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs sm:text-sm text-foreground">
                  <span className="font-semibold text-foreground">Real-Time Cloud Sync</span> — Instant travel & passcode sync
                </div>
              </div>
            </div>
          ) : (
            /* iOS Specific Instructions */
            <div className="w-full text-left mb-6 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/30 space-y-3">
              <p className="text-xs sm:text-sm text-foreground font-medium">
                To install on iOS:
              </p>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-muted-foreground">
                <span className="font-bold text-orange-600">1.</span>
                <span>Tap the <Share className="w-4 h-4 inline text-orange-600 mx-1" /> <strong>Share</strong> button in Safari toolbar.</span>
              </div>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-muted-foreground">
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
              className="w-full py-2.5 px-4 text-muted-foreground hover:text-foreground font-medium text-xs sm:text-sm rounded-xl transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
