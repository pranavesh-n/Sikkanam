import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, LifeBuoy, Sparkles, X, Mail, MessageCircle, Heart } from "lucide-react";
import logo from "@/assets/logo.png";

export const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<"support" | "privacy" | "terms" | null>(null);

  return (
    <footer className="w-full bg-card/90 dark:bg-zinc-950/90 border-t border-border/80 text-card-foreground mt-auto transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Left Side: Brand Logo & Tagline */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow-xs">
            <img src={logo} alt="Sikkanam Logo" className="w-full h-full object-cover scale-[1.08]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 justify-center md:justify-start">
              <span className="font-display font-extrabold text-sm tracking-tight text-foreground">
                Sikkanam
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Privacy-first budget travel planning for Tamil Nadu
            </p>
          </div>
        </div>

        {/* Right Side Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 text-muted-foreground font-medium text-[11px] md:text-xs">
          <button
            onClick={() => setActiveModal("support")}
            className="hover:text-foreground transition-colors focus:outline-none"
          >
            Support
          </button>

          <button
            onClick={() => setActiveModal("privacy")}
            className="hover:text-foreground transition-colors focus:outline-none"
          >
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveModal("terms")}
            className="hover:text-foreground transition-colors focus:outline-none"
          >
            Terms of Service
          </button>

          <Link
            to="/whats-new"
            className="hover:text-foreground text-primary font-semibold transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            What's New
          </Link>

          <span className="text-border hidden sm:inline">•</span>

          <span className="text-foreground/80 font-semibold">
            © 2026 Sikkanam · Made in Tamil Nadu, India
          </span>
        </div>
      </div>

      {/* SUPPORT MODAL */}
      {activeModal === "support" && (
        <div className="fixed inset-0 z-[99995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-sm w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-3">
              <LifeBuoy className="w-5 h-5" />
            </div>

            <h3 className="font-display font-extrabold text-lg text-foreground mb-1">
              Sikkanam Support & Help
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Have questions, feedback, or need help planning your Tamil Nadu budget trip?
            </p>

            <div className="space-y-2.5">
              <a
                href="mailto:sikkanam.customerfeedback@gmail.com"
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors"
              >
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Email Support</div>
                  <div className="text-[11px] text-muted-foreground">sikkanam.customerfeedback@gmail.com</div>
                </div>
              </a>

              <a
                href="https://wa.me/916374161918?text=Hi%20Sikkanam%20Team"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors"
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">WhatsApp Support Desk</div>
                  <div className="text-[11px] text-muted-foreground">Chat with Sikkanam Team</div>
                </div>
              </a>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-xl gradient-saffron text-white font-bold text-xs shadow-card"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PRIVACY POLICY MODAL */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-[99995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <h3 className="font-display font-extrabold text-lg text-foreground mb-1">
              Privacy Policy
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Effective Date: 2026 • Sikkanam Travel Platform
            </p>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1. Privacy First Architecture:</strong> Sikkanam is built with strict privacy-first principles. Your search filters, itinerary calculations, and travel selections are stored locally on your device or safely synchronized via encrypted Firebase Cloud Firestore.
              </p>
              <p>
                <strong className="text-foreground">2. Google Authentication:</strong> When you sign in with Google, we only request standard basic profile information (email and display name) necessary to identify your account and sync your saved trips across devices.
              </p>
              <p>
                <strong className="text-foreground">3. Zero Data Sale:</strong> We never sell, lease, or monetize your personal travel data or location history to third-party ad networks.
              </p>
              <p>
                <strong className="text-foreground">4. PIN Passcode Security:</strong> Your 4-digit security PIN lock is hashed locally and synced over SSL to Cloud Firestore for cross-device authentication.
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-xl gradient-saffron text-white font-bold text-xs shadow-card"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* TERMS OF SERVICE MODAL */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-[99995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-150 text-left max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center mb-3">
              <FileText className="w-5 h-5" />
            </div>

            <h3 className="font-display font-extrabold text-lg text-foreground mb-1">
              Terms of Service
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Last Updated: 2026 • Sikkanam Travel Platform
            </p>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">1. Service Usage:</strong> Sikkanam provides AI-assisted travel estimates, route calculations, and budget planning tools for informational and personal travel use in Tamil Nadu.
              </p>
              <p>
                <strong className="text-foreground">2. Estimates & Dynamic Fares:</strong> Transport costs (bus, train, cab), hotel rates, and weather forecasts are dynamically estimated using Open-Meteo feeds and algorithmic models. Real-world fares may vary based on seasonal peak demand and booking vendors.
              </p>
              <p>
                <strong className="text-foreground">3. User Responsibility:</strong> Travelers are advised to verify safety guidelines, local weather warnings, and transport schedules prior to travel.
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-2.5 rounded-xl gradient-saffron text-white font-bold text-xs shadow-card"
            >
              Accept Terms
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
