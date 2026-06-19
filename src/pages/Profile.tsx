import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark, Info, Mail, MessageCircle, X, ShieldCheck, Route, Utensils, Hotel, Coins } from "lucide-react";

const Profile = () => {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-6 space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 text-center">
        <div className="w-16 h-16 mx-auto rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-card">
          S
        </div>

        <h2 className="font-display font-bold mt-3">
          Welcome, Traveller
        </h2>

        <p className="text-xs text-muted-foreground mt-1">
          Sign-in coming soon — bookmarks and trips will sync across devices.
        </p>
      </div>

      <Section title="Coming soon">
        <Row
          icon={Bookmark}
          label="Saved trips"
          desc="Save AI itineraries for later"
          disabled
        />

        <Row
          icon={Heart}
          label="Favourites"
          desc="Your favourite destinations"
          disabled
        />
      </Section>

      <Section title="About">
        <div
          onClick={() => setShowAbout(true)}
          className="block cursor-pointer"
        >
          <Row
            icon={Info}
            label="About Sikkanam"
            desc="A budget travel companion for Tamil Nadu"
          />
        </div>

        <a
          href="mailto:sikkanam.customerfeedback@gmail.com"
          className="block"
        >
          <Row
            icon={Mail}
            label="Contact"
            desc="sikkanam.customerfeedback@gmail.com"
          />
        </a>

        <a
          href="https://wa.me/6374161918?text=Hi%20Sikkanam%20Team"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Row
            icon={MessageCircle}
            label="WhatsApp"
            desc="+91 6374161918"
          />
        </a>
      </Section>

      <p className="text-center text-[11px] text-muted-foreground pt-2">
        சிக்கனம் · Sikkanam v2.0
      </p>

      {showAbout && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowAbout(false)}
        >
          <div 
            className="bg-card rounded-[2rem] max-w-lg w-full p-6 md:p-8 shadow-elevated border border-border animate-in zoom-in duration-200 flex flex-col max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 grid place-items-center rounded-xl gradient-saffron text-primary-foreground shadow-card shrink-0">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-display font-extrabold text-xl md:text-2xl text-foreground">
                    About Sikkanam
                  </h2>
                  <p className="text-[10px] text-muted-foreground">சிக்கனம் · Tamil Nadu Travel Companion</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAbout(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-left text-sm text-foreground">
              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                In Tamil, <strong className="text-primary font-semibold">Sikkanam (சிக்கனம்)</strong> means <em>thriftiness</em> or <em>economy</em>.
              </p>

              <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                We built this platform because travel planning should not be a guessing game. While others give generic, unexplained estimates, Sikkanam ensures <strong>trust through transparency</strong>—breaking down every single rupee.
              </p>

              <div className="border-t border-border/60 pt-3">
                <h3 className="font-display font-extrabold text-[11px] text-primary uppercase tracking-wider mb-2.5">
                  How we ensure accuracy
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50 hover:bg-muted/65 transition-colors">
                    <span className="text-sm shrink-0">🗺️</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[10px] text-foreground leading-tight">Road Distances</p>
                      <p className="text-[9px] text-muted-foreground truncate leading-normal">OpenStreetMap routing</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50 hover:bg-muted/65 transition-colors">
                    <span className="text-sm shrink-0">🍽️</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[10px] text-foreground leading-tight">Food Costs</p>
                      <p className="text-[9px] text-muted-foreground truncate leading-normal">Meal-by-meal adjustment</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50 hover:bg-muted/65 transition-colors">
                    <span className="text-sm shrink-0">🏨</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[10px] text-foreground leading-tight">Lodging Index</p>
                      <p className="text-[9px] text-muted-foreground truncate leading-normal">Real town inventory</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50 hover:bg-muted/65 transition-colors">
                    <span className="text-sm shrink-0">🎟️</span>
                    <div className="min-w-0">
                      <p className="font-bold text-[10px] text-foreground leading-tight">Attraction Fees</p>
                      <p className="text-[9px] text-muted-foreground truncate leading-normal">Official district records</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex items-start gap-2.5 mt-2">
                <span className="text-xs shrink-0 mt-0.5">🛡️</span>
                <p className="text-[10px] text-primary leading-normal font-medium">
                  Zero guesswork, zero booking fees. Built for budget-conscious travellers exploring Tamil Nadu.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full mt-5 py-3 rounded-xl gradient-saffron text-white font-semibold text-sm shadow-card active:scale-[0.98] transition-transform hover:opacity-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <section>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
      {title}
    </p>

    <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
      {children}
    </div>
  </section>
);

const Row = ({ icon: Icon, label, desc, disabled }: any) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 ${
      disabled ? "opacity-60" : "active:bg-muted"
    }`}
  >
    <span className="w-8 h-8 grid place-items-center rounded-full bg-primary/10 text-primary">
      <Icon className="w-4 h-4" />
    </span>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold">{label}</p>

      <p className="text-[11px] text-muted-foreground truncate">
        {desc}
      </p>
    </div>

    {disabled && (
      <span className="text-[10px] uppercase font-bold text-muted-foreground">
        Soon
      </span>
    )}
  </div>
);

export default Profile;
