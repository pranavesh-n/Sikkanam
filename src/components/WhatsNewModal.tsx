import { useState, MouseEvent } from "react";
import { Sparkles, ShieldCheck, Bookmark, Heart, X } from "lucide-react";

const VERSION = "2.3";

// Module-level variable to prevent showing the modal multiple times in the same session
// even if storage is completely blocked or wiped.
let hasDismissedInSession = false;

// Helper to retrieve cookies
const getCookie = (name: string): string | null => {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
};

// Helper to save cookies (expires in 1 year)
const setCookie = (name: string, value: string, days: number = 365) => {
  try {
    const seconds = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${seconds}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn("Failed to set cookie:", e);
  }
};

export default function WhatsNewModal() {
  // Synchronously determine if the modal should be open during initial state declaration
  const [open, setOpen] = useState(() => {
    if (hasDismissedInSession) {
      return false;
    }

    try {
      // 1. Check localStorage
      const seenLocal = localStorage.getItem("sikkanam-version");
      if (seenLocal === VERSION) {
        hasDismissedInSession = true;
        return false;
      }
    } catch (e) {
      console.warn("localStorage check failed:", e);
    }

    try {
      // 2. Check Cookie (fallback for webviews/private tabs)
      const seenCookie = getCookie("sikkanam-version");
      if (seenCookie === VERSION) {
        hasDismissedInSession = true;
        
        // Sync the result back to localStorage if it's available
        try {
          localStorage.setItem("sikkanam-version", VERSION);
        } catch (err) {}
        
        return false;
      }
    } catch (e) {
      console.warn("Cookie check failed:", e);
    }

    return true;
  });

  const handleClose = () => {
    hasDismissedInSession = true;
    
    // Save to localStorage
    try {
      localStorage.setItem("sikkanam-version", VERSION);
    } catch (e) {
      console.warn("Failed to save to localStorage:", e);
    }
    
    // Save to Cookie
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
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="bg-card/95 border border-border/80 rounded-[2.5rem] max-w-sm md:max-w-md w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative overflow-hidden">
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
          NEW • Version {VERSION}
        </div>

        {/* Title */}
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-2 text-left">
          What's New in Sikkanam
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-muted-foreground mb-6 text-left">
          New destinations, legendary food spots, and smarter trip planning — all in one update!
        </p>

        {/* Feature List */}
        <div className="space-y-4 text-foreground flex-1">
          {/* Feature 1 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Google Authentication</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Google Login is seamlessly integrated and synchronized across Databases.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Exact Route & Distance Calculator</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get exact road-network driving distances between any starting point and destination in Tamil Nadu.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Budget Transit Estimator </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compare instant travel times and cost breakdowns for TNSTC Buses, Express Trains, and Cabs.
              </p>
            </div>
          </div>
          {/* Feature 4 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Calculate Exact Route & Fare</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get routes and fares directly from any destination detail card on the Explore page.
              </p>
            </div>
          </div>

          {/* Feature 5 — New Destinations */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 shrink-0">
              <span className="text-base leading-none">🪷</span>
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">New: Srivilliputhur & Courtallam+</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Andal Kovil (TN State Emblem), Palkova sweets &amp; Kartick Mess added. Courtallam now lists all 7 falls + the legendary Rahmath Kadai parotta &amp; mutton biryani spot.
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

// Simple local Helper for ArrowRight icon inside button
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
