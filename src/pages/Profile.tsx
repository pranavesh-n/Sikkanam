import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Bookmark, Info, Mail, LogOut, Lock, KeyRound, Smartphone, Download, CheckCircle2, Sparkles, X, ShieldCheck, Trash2, BadgeCheck, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppLock } from "@/context/AppLockContext";
import { PasscodeSetupModal } from "@/components/PasscodeSetupModal";
import { DisablePasscodeModal } from "@/components/DisablePasscodeModal";
import InstallPWAModal from "@/components/InstallPWAModal";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import logo from "@/assets/logo.png";

import { usePwaInstall } from "@/hooks/usePwaInstall";

const Profile = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const { isLockEnabled } = useAppLock();
  const { isInstalled: isPwaInstalled, markInstalled } = usePwaInstall();
  const navigate = useNavigate();

  const [showAbout, setShowAbout] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showDisablePasscode, setShowDisablePasscode] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [savedCount, setSavedCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      // Fetch Saved Trips Count
      fetch("/api/trips")
        .then((res) => res.ok && res.json())
        .then((data) => data && setSavedCount((data.trips || []).length))
        .catch(() => { });

      // Fetch Wishlist Count
      fetch("/api/wishlist")
        .then((res) => res.ok && res.json())
        .then((data) => data && setWishlistCount((data.wishlist || []).length))
        .catch(() => { });
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
      navigate("/", { replace: true });
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
        markInstalled();
        toast.success("Sikkanam App installed successfully!");
      }
      (window as any).deferredPwaPrompt = null;
    } catch (e) {
      setShowPwaModal(true);
    }
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      toast.success("Temporary session cache cleared successfully");
    } catch {
      toast.error("Could not clear session cache");
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
            <div className="relative inline-block mx-auto">
              {user.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-primary/30 ring-4 ring-primary/10"
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-16 h-16 rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-md ring-4 ring-primary/10">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-card shadow-sm" title="Active Account">
                <BadgeCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <h2 className="font-display font-extrabold mt-3 text-lg sm:text-xl text-foreground flex items-center justify-center gap-1.5">
              <span>{user.name}</span>
            </h2>

            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground font-medium">
                {user.email}
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                Verified Explorer
              </span>
            </div>

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
            <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20 mb-3">
              <img src={logo} alt="Sikkanam" className="w-full h-full object-cover scale-[1.08]" />
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
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-0.5 shadow-sm">
                <GoogleIcon className="w-3.5 h-3.5" />
              </div>
              <span>Sign in with Google</span>
            </button>
          </>
        )}
      </div>

      {/* Security & Privacy Section */}
      <Section title="Security & Privacy">
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

        <button
          onClick={handleClearCache}
          className="block w-full text-left focus:outline-none"
        >
          <Row
            icon={Trash2}
            label="Clear Temporary Cache"
            desc="Reset local session state & refresh travel cache"
          />
        </button>
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

        <Link to="/whats-new" className="block">
          <Row
            icon={Sparkles}
            label="What's New in Sikkanam"
            desc="Monthly feature release notes & updates"
          />
        </Link>
      </Section>

      {/* Support & Community Section - No phone number text shown */}
      <Section title="Support & Community">
        <button onClick={() => setShowFeedbackModal(true)} className="block w-full text-left focus:outline-none">
          <Row
            icon={MessageSquare}
            label="Share Feedback & Report Issues"
            desc="Report timing corrections, transit fixes, or feature requests"
          />
        </button>

        <a
          href="https://wa.me/916374161918?text=Hi%20Sikkanam%20Team"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Row
            icon={WhatsAppIcon}
            label="WhatsApp Support Desk"
            desc="Chat directly with Sikkanam Travel Assistance"
          />
        </a>

        <a
          href="mailto:sikkanam.customerfeedback@gmail.com"
          className="block"
        >
          <Row
            icon={Mail}
            label="Official Support Email"
            desc="sikkanam.customerfeedback@gmail.com"
          />
        </a>

        <button onClick={() => setShowAbout(true)} className="block w-full text-left focus:outline-none">
          <Row
            icon={Info}
            label="About Sikkanam"
            desc="Origin, mission & budget travel companion for Tamil Nadu"
          />
        </button>
      </Section>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

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
        சிக்கனம் · Sikkanam v2.6.4
      </p>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/80 rounded-[2.5rem] max-w-md w-full p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col relative text-left overflow-hidden">
            {/* Background ambient light */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Pristine Logo & Brand */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-orange-500/20 shrink-0">
                <img
                  src={logo}
                  alt="Sikkanam Logo"
                  className="w-full h-full object-cover scale-[1.08]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-2xl text-foreground tracking-tight">
                    Sikkanam
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-xs">
                    சிக்கனம்
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Tamil Nadu's #1 AI Budget Travel Companion
                </p>
              </div>
            </div>

            {/* Word Origin Definition Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 mb-5">
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                <span className="font-bold text-amber-800 dark:text-amber-200">Word Origin: </span>
                <strong className="font-bold">"Sikkanam" (சிக்கனம்)</strong> is Tamil for <em className="not-italic font-semibold underline decoration-amber-400 decoration-2">economy, frugality, and smart budgeting</em>.
              </div>
            </div>

            {/* Narrative & Mission */}
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-5">
              Sikkanam empowers travelers to explore the rich heritage of Tamil Nadu—from foggy Ooty peaks and pristine Kanyakumari shores to ancient Madurai temples—with complete financial transparency and smart AI route planning.
            </p>

            {/* Core Features / Highlights Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs font-semibold text-foreground">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span>AI Itineraries</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span>Exact Fares</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <span>PIN Protection</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </span>
                <span>Smart PWA</span>
              </div>
            </div>

            {/* Footer Info & Action */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] text-muted-foreground font-medium">
              <span>Sikkanam v2.6.4 • Stable</span>
              <span>Made in Tamil Nadu ❤️</span>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full mt-4 py-3 rounded-xl gradient-saffron text-white font-bold text-xs md:text-sm shadow-card active:scale-[0.98] transition-transform text-center hover:opacity-95"
            >
              Explore Sikkanam
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
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badge === "ON"
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
