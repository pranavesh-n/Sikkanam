import { useState, MouseEvent } from "react";
import { Sparkles, Lock, Flame, ShieldCheck, UserCheck, Smartphone, X } from "lucide-react";

const VERSION = "2.4";

// Module-level variable to prevent showing the modal multiple times in the same session
let hasDismissedInSession = false;

const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
};

const setCookie = (name: string, value: string, days: number = 365) => {
  try {
    const seconds = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn("Failed to set cookie:", e);
  }
};

export default function WhatsNewModal() {
  const [open, setOpen] = useState(() => {
    if (hasDismissedInSession) {
      return false;
    }

    try {
      const seenLocal = localStorage.getItem("sikkanam-version");
      if (seenLocal === VERSION) {
        hasDismissedInSession = true;
        return false;
      }
    } catch (e) {}

    try {
      const seenCookie = getCookie("sikkanam-version");
      if (seenCookie === VERSION) {
        hasDismissedInSession = true;
        try {
          localStorage.setItem("sikkanam-version", VERSION);
        } catch (err) {}
        return false;
      }
    } catch (e) {}

    return true;
  });

  const handleClose = () => {
    hasDismissedInSession = true;
    try {
      localStorage.setItem("sikkanam-version", VERSION);
    } catch (e) {}
    setCookie("sikkanam-version", VERSION);
    setOpen(false);
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!open) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="bg-card/95 border border-border/80 rounded-[2.5rem] max-w-sm md:max-w-md w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative overflow-hidden text-left">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Tag */}
        <div className="mb-4 self-start flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] md:text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          NEW • VERSION {VERSION}
        </div>

        {/* Title */}
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-2 text-left">
          What's New in Sikkanam
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-muted-foreground mb-6 text-left">
          Cloud Firestore sync, "Already a Sikkanam User?" Web Gateway, Profile Redesign, and App Lock!
        </p>

        {/* Feature List */}
        <div className="space-y-4 text-foreground flex-1">
          {/* Feature 1 — Cloud Firestore Sync */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Cloud Firestore Real-Time Sync</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Passcode lock status and credentials sync instantly across PC and Mobile in real-time.
              </p>
            </div>
          </div>

          {/* Feature 2 — Already a Sikkanam User Gateway */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">"Already a Sikkanam User?" Gateway</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Seamless web entry modal for browser visitors to sign in with Google or continue exploring as guest.
              </p>
            </div>
          </div>

          {/* Feature 3 — App Passcode Lock */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">4-Digit App Passcode Lock</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Protect saved itineraries, wishlists, and travel plans with 35s background auto-lock & PIN verification.
              </p>
            </div>
          </div>

          {/* Feature 4 — Smart PWA Adoption */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Smart PWA & Profile Redesign</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                1-tap mobile installation, uninstallation detection, and interactive stat counter badges on Profile.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full mt-7 py-3.5 rounded-[1.25rem] gradient-saffron text-white font-bold text-sm md:text-base shadow-card active:scale-[0.98] transition-transform hover:opacity-95 text-center flex items-center justify-center gap-2"
        >
          Explore New Features <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
