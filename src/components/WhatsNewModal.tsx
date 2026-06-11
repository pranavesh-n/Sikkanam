import { useEffect, useState } from "react";

const VERSION = "2.0.0";

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
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-[2rem] max-w-sm w-full p-6 md:p-8 shadow-elevated border border-border animate-in zoom-in duration-200 flex flex-col">
        <div className="mb-4 self-start">
          <span className="bg-primary/10 text-primary text-[10px] md:text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            NEW • Intelligence Engine v4.3
          </span>
        </div>

        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-3">
          🚀 What's New
        </h2>

        <p className="text-sm md:text-base text-muted-foreground mb-6">
          Travel planning is now smarter, more transparent, and more reliable.
        </p>

               <div className="space-y-4 text-foreground flex-1">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0">✅</span>
            <span className="text-sm md:text-base font-medium">Improved Sikkanam intelligence on planning a trip</span>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-full mt-8 py-3.5 rounded-[1.25rem] gradient-saffron text-white font-semibold text-sm md:text-base shadow-card active:scale-[0.98] transition-transform hover:opacity-95"
        >
          ✨ Explore New Features
        </button>
      </div>
    </div>
  );
}
