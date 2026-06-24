import { useEffect, useState } from "react";
import { Sparkles, Map, ShieldCheck, Bookmark, Heart, X } from "lucide-react";

const VERSION = "3.0.0";

export default function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("sikkanam-version");
    if (seen !== VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("sikkanam-version", VERSION);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-in fade-in duration-300">
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
          Your travel companion has been upgraded with maps, unified cloud savings, and seamless actions!
        </p>

        {/* Feature List */}
        <div className="space-y-4 text-foreground flex-1">
          {/* Feature 1 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Interactive OSM Route Maps</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Explore destinations with full route intelligence and navigation on interactive map views.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Unified 3-DB Authentication</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Google Login is seamlessly integrated and synchronized across Firebase, Supabase, and MongoDB.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Itinerary Management</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Easily save, rename, or delete your custom travel itineraries directly in your profile dashboard.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex gap-3.5 items-start text-left">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm md:text-base text-foreground">Synced Wishlist</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your favorited destinations are fully synchronized and accessible across all your logged-in devices.
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
