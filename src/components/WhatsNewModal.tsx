import { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, ShieldCheck, Cloud, Share2, Flame, Smartphone, X } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";

const VERSION = "2.6.3";

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
          What's New in Sikkanam v2.6.3
        </h2>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-muted-foreground mb-6 text-left">
          1-Click Wishlist on Trip Plans, AI 2.0 Security Guardrails, Cloud Logout Sync & Official WhatsApp Sharing!
        </p>

        {/* Feature List */}
        <div className="space-y-4 text-foreground flex-1">
          {/* Feature 1 — 1-Click Direct Wishlist on Trip Plans */}
          <div className="flex gap-3.5 items-start text-left bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">1-Click Wishlist on Trip Plans</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bookmark any destination directly from generated AI trip plans into your wishlist with instant real-time sync across all pages.
              </p>
            </div>
          </div>

          {/* Feature 2 — Sikkanam AI 2.0 Enterprise Security Guardrails */}
          <div className="flex gap-3.5 items-start text-left bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Sikkanam AI 2.0 Security Guardrails</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hardened anti-jailbreak detection, role spoofing defense, payload caps, and unbreakable prompt security.
              </p>
            </div>
          </div>

          {/* Feature 3 — Multi-Device Cloud Logout Sync */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Multi-Device Cloud Logout Sync</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Signing out on your PC automatically signals and signs out all active sessions across all your devices in real time.
              </p>
            </div>
          </div>

          {/* Feature 4 — Official WhatsApp Sharing */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Official WhatsApp Sharing</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share complete trip itineraries to WhatsApp groups with authentic branding and rich formatted summaries.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/whats-new"
          onClick={handleClose}
          className="w-full mt-7 py-3.5 rounded-[1.25rem] gradient-saffron text-white font-bold text-sm md:text-base shadow-card active:scale-[0.98] transition-transform hover:opacity-95 text-center flex items-center justify-center gap-2"
        >
          Explore All Monthly Updates <ArrowRight className="w-4 h-4" />
        </Link>
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
