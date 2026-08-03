import { MouseEvent } from "react";
import { Sparkles, Calendar, Lock, Flame, UserCheck, Smartphone, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

const VERSION = "2.6.1";

export default function WhatsNewModal() {
  const { step, dismissWhatsNew } = useOnboarding();

  if (step !== "WHATS_NEW") return null;

  const handleClose = () => {
    dismissWhatsNew();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-in fade-in duration-300"
    >
      <div className="bg-card/95 border border-border/80 rounded-[2.5rem] max-w-sm md:max-w-md w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
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
          What's New in Sikkanam v2.6.1
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-muted-foreground mb-6 text-left">
          100 Destinations Milestone, 21 Heritage Destinations, Interactive Circuit Route Buttons & Universal Emojis!
        </p>

        {/* Feature List */}
        <div className="space-y-4 text-foreground flex-1">
          {/* Feature 1 — 100 Destinations Milestone & 21 Heritage Destinations */}
          <div className="flex gap-3.5 items-start text-left bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">100 Destinations Milestone & 21 Heritage Sites</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Added 13 brand new heritage destinations (Gingee Fort, Pudukkottai, Sittannavasal, Thirumayam, Padmanabhapuram, Keezhadi) to reach 100 total destinations with 21 rich heritage spots!
              </p>
            </div>
          </div>

          {/* Feature 2 — Interactive Circuit Buttons */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Interactive Circuit & Route Badges</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Circuit stops are now clickable pill buttons with active location badges (<span className="font-bold text-foreground">📍 Coonoor (Current)</span>) and 1-tap route navigation.
              </p>
            </div>
          </div>

          {/* Feature 3 — Live Weather Forecast & Open-Meteo */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">User Choice Calendar & Live Open-Meteo Feed</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select any custom date across the year! Includes Open-Meteo ECMWF live forecasts, rain risk warnings, and indoor attraction alternatives.
              </p>
            </div>
          </div>

          {/* Feature 4 — Universal Cross-Platform Emojis */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Universal Cross-Platform Icon System</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clean visual emojis across all destinations, eliminating raw country codes and ensuring crisp rendering on Windows, Android, Mac, and iOS.
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
