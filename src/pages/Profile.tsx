import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark, Info, Mail, MessageCircle, LogOut, Lock, KeyRound, Smartphone, Download, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppLock } from "@/context/AppLockContext";
import { PasscodeSetupModal } from "@/components/PasscodeSetupModal";
import { DisablePasscodeModal } from "@/components/DisablePasscodeModal";
import InstallPWAModal from "@/components/InstallPWAModal";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { isLockEnabled } = useAppLock();
  const [showAbout, setShowAbout] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showDisablePasscode, setShowDisablePasscode] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [savedCount, setSavedCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [isPwaInstalled, setIsPwaInstalled] = useState<boolean>(() => {
    try {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true
      );
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      
      setIsPwaInstalled(isStandalone);
    };

    checkInstalled();
    window.addEventListener("appinstalled", checkInstalled);
    return () => {
      window.removeEventListener("appinstalled", checkInstalled);
    };
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch Saved Trips Count
      fetch("/api/trips")
        .then((res) => res.ok && res.json())
        .then((data) => data && setSavedCount((data.trips || []).length))
        .catch(() => {});

      // Fetch Wishlist Count
      fetch("/api/wishlist")
        .then((res) => res.ok && res.json())
        .then((data) => data && setWishlistCount((data.wishlist || []).length))
        .catch(() => {});
    } else {
      setSavedCount(0);
      setWishlistCount(0);
    }
  }, [user]);

  const handleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast.success("Successfully logged in");
    } else {
      toast.error("Google login failed");
    }
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      toast.success("Successfully logged out");
    } else {
      toast.error("Logout failed");
    }
  };

  const handlePwaClick = async () => {
    const promptEvent = (window as any).deferredPwaPrompt;

    if (!promptEvent) {
      setShowPwaModal(true);
      return;
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        setIsPwaInstalled(true);
        try {
          localStorage.setItem("sikkanam_pwa_installed", "true");
        } catch (e) {}
        toast.success("Sikkanam App installed successfully!");
      }
      (window as any).deferredPwaPrompt = null;
    } catch (e) {
      setShowPwaModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-12 space-y-4">
      {/* User / Guest Hero Header Card */}
      <div className="bg-card border border-border rounded-3xl p-5 sm:p-6 text-center shadow-sm relative overflow-hidden">
        {user ? (
          <>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 mx-auto rounded-full object-cover shadow-md border-2 border-primary/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="font-display font-extrabold mt-3 text-lg sm:text-xl text-foreground">
              Welcome, {user.name}
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {user.email}
            </p>

            {/* Interactive Stat Count Cards */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-border/50">
              <Link
                to="/saved-trips"
                className="bg-muted/50 hover:bg-muted p-3 rounded-2xl border border-border/60 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-foreground truncate">
                    {savedCount} {savedCount === 1 ? "Trip" : "Trips"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    Saved Itineraries
                  </p>
                </div>
              </Link>

              <Link
                to="/wishlist"
                className="bg-muted/50 hover:bg-muted p-3 rounded-2xl border border-border/60 transition-all text-left flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 grid place-items-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-foreground truncate">
                    {wishlistCount} {wishlistCount === 1 ? "Place" : "Places"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">
                    Saved Wishlist
                  </p>
                </div>
              </Link>
            </div>
          </>
        ) : (
          /* Guest Hero Banner */
          <>
            <div className="w-16 h-16 mx-auto rounded-3xl gradient-saffron grid place-items-center text-white shadow-lg shadow-orange-500/20 mb-3 overflow-hidden">
              <img src="/logo.png" alt="Sikkanam" className="w-11 h-11 object-contain" />
            </div>

            <h2 className="font-display font-extrabold text-xl text-foreground">
              Welcome, Traveller
            </h2>

            <p className="text-xs text-muted-foreground mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
              Sign in with Google to sync your saved itineraries, wishlists, and 4-digit passcode lock across all your devices.
            </p>

            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full gradient-saffron text-white font-bold text-sm shadow-card active:scale-[0.98] transition-transform w-full sm:w-auto"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.386-2.876-6.386-6.386s2.876-6.386 6.386-6.386c1.697 0 3.2.664 4.343 1.74l3.124-3.124C19.346 2.23 16.03 1 12.24 1 5.766 1 .5 6.266.5 12.74S5.766 24.48 12.24 24.48c6.549 0 11.59-4.603 11.59-11.59 0-.765-.082-1.5-.23-2.22H12.24z" />
              </svg>
              Sign in with Google
            </button>
          </>
        )}
      </div>

      {/* Account & Security Section */}
      <Section title="Account & Security">
        <button
          onClick={() => {
            if (!user) {
              setShowAuthModal(true);
              return;
            }
            if (isLockEnabled) {
              setShowDisablePasscode(true);
            } else {
              setShowPasscodeSetup(true);
            }
          }}
          className="block w-full text-left focus:outline-none"
        >
          <Row
            icon={Lock}
            label="App Passcode Lock"
            desc={
              !user
                ? "Sign in with Google to enable 4-digit PIN passcode"
                : isLockEnabled
                ? "4-digit PIN lock enabled (Tap to disable)"
                : "Protect app with 4-digit PIN passcode"
            }
            badge={user ? (isLockEnabled ? "ON" : "OFF") : undefined}
            disabled={!user}
          />
        </button>

        {user && isLockEnabled && (
          <button
            onClick={() => setShowPasscodeSetup(true)}
            className="block w-full text-left focus:outline-none"
          >
            <Row
              icon={KeyRound}
              label="Change Passcode"
              desc="Update your 4-digit PIN code"
            />
          </button>
        )}
      </Section>

      {/* App Experience Section */}
      <Section title="App Experience">
        <button
          onClick={handlePwaClick}
          className="block w-full text-left focus:outline-none"
        >
          <Row
            icon={Smartphone}
            label="Sikkanam App"
            desc={
              isPwaInstalled
                ? "App is installed & ready on your device"
                : "Add to home screen for 1-tap fast access"
            }
            customBadge={
              isPwaInstalled ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Installed
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <Download className="w-3 h-3" /> Install
                </span>
              )
            }
          />
        </button>
      </Section>

      {/* Support & About Section */}
      <Section title="Support & About">
        <button onClick={() => setShowAbout(true)} className="block w-full text-left focus:outline-none">
          <Row
            icon={Info}
            label="About Sikkanam"
            desc="A budget travel companion for Tamil Nadu"
          />
        </button>

        <a
          href="mailto:sikkanam.customerfeedback@gmail.com"
          className="block"
        >
          <Row
            icon={Mail}
            label="Contact Email"
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
            label="WhatsApp Community"
            desc="+91 6374161918"
          />
        </a>
      </Section>

      {/* Sign Out Action */}
      {user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 active:scale-[0.98] transition-transform text-sm font-semibold mt-2"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 grid place-items-center rounded-full bg-destructive/25 text-destructive">
              <LogOut className="w-4 h-4" />
            </span>
            <span>Sign Out</span>
          </div>
          <span>→</span>
        </button>
      )}

      <p className="text-center text-[11px] text-muted-foreground pt-3">
        சிக்கனம் · Sikkanam v2.4
      </p>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-[4px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-[2rem] max-w-sm w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
            <h3 className="font-display font-extrabold text-xl md:text-2xl text-foreground mb-3 flex items-center gap-2">
              <span className="text-primary font-bold">சிக்கனம்</span> · About
            </h3>
            <div className="space-y-3.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
              <p>
                <strong>Sikkanam (சிக்கனம்)</strong> is Tamil for <em>economy, frugality, or budgeting</em>.
              </p>
              <p>
                This application is your intelligent, AI-powered travel assistant built to help you explore the absolute best of Tamil Nadu—from misty hills and sun-drenched beaches to historic temples—while keeping your expenditures low.
              </p>
              <p>
                We fetch budget-friendly transport details, calculate optimal stay rates, estimate dining expenses, and build optimized itineraries with full cost transparency.
              </p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full mt-6 py-3 rounded-xl gradient-saffron text-white font-bold text-xs md:text-sm shadow-card active:scale-[0.98] transition-transform text-center hover:opacity-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Passcode Setup & Disable Modals */}
      <PasscodeSetupModal
        isOpen={showPasscodeSetup}
        onClose={() => setShowPasscodeSetup(false)}
      />

      <DisablePasscodeModal
        isOpen={showDisablePasscode}
        onClose={() => setShowDisablePasscode(false)}
      />

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* PWA Install Modal Fallback */}
      <InstallPWAModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <section>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
      {title}
    </p>

    <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-sm">
      {children}
    </div>
  </section>
);

const Row = ({ icon: Icon, label, desc, disabled, badge, customBadge }: any) => (
  <div
    className={`flex items-center gap-3 px-4 py-3.5 ${disabled ? "opacity-60" : "active:bg-muted"
      }`}
  >
    <span className="w-8 h-8 grid place-items-center rounded-full bg-primary/10 text-primary flex-shrink-0">
      <Icon className="w-4 h-4" />
    </span>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground">{label}</p>

      <p className="text-[11px] text-muted-foreground truncate">
        {desc}
      </p>
    </div>

    {customBadge ? (
      customBadge
    ) : badge ? (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          badge === "ON"
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            : "bg-muted text-muted-foreground border border-border"
        }`}
      >
        {badge}
      </span>
    ) : null}
  </div>
);

export default Profile;
