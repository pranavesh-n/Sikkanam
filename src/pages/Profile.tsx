import { Link } from "react-router-dom";
import { Heart, Bookmark, Info, Mail, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading, loginWithGoogle, logout } = useAuth();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-3xl mx-auto px-4 md:px-6 pt-3 md:pt-8 pb-6 space-y-4">
      <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
        {user ? (
          <>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 mx-auto rounded-full object-cover shadow-card"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 mx-auto rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-card">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h2 className="font-display font-bold mt-3 text-lg">
              Welcome, {user.name}
            </h2>

            <p className="text-xs text-muted-foreground mt-0.5">
              {user.email}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-full gradient-saffron grid place-items-center text-primary-foreground font-display font-extrabold text-2xl shadow-card">
              S
            </div>

            <h2 className="font-display font-bold mt-3">
              Welcome, Traveller
            </h2>

            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Sign in to sync your wishlist and saved itineraries across devices.
            </p>

            <button
              onClick={handleLogin}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-full gradient-saffron text-primary-foreground font-semibold text-sm shadow-card active:scale-[0.98] transition-transform w-full sm:w-auto"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.386-2.876-6.386-6.386s2.876-6.386 6.386-6.386c1.697 0 3.2.664 4.343 1.74l3.124-3.124C19.346 2.23 16.03 1 12.24 1 5.766 1 .5 6.266.5 12.74S5.766 24.48 12.24 24.48c6.549 0 11.59-4.603 11.59-11.59 0-.765-.082-1.5-.23-2.22H12.24z"/>
              </svg>
              Sign in with Google
            </button>
          </>
        )}
      </div>

      <Section title={user ? "Personalization" : "Features (Login Required)"}>
        {user ? (
          <>
            <Link to="/saved-trips" className="block">
              <Row
                icon={Bookmark}
                label="Saved Trips"
                desc="View and manage your saved itineraries"
              />
            </Link>

            <Link to="/wishlist" className="block">
              <Row
                icon={Heart}
                label="Wishlist"
                desc="Your handpicked wishlist destinations"
              />
            </Link>
          </>
        ) : (
          <>
            <Row
              icon={Bookmark}
              label="Saved trips"
              desc="Save AI itineraries for later"
              disabled
            />

            <Row
              icon={Heart}
              label="Wishlist"
              desc="Your wishlist destinations"
              disabled
            />
          </>
        )}
      </Section>

      {user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 active:scale-[0.98] transition-transform text-sm font-semibold"
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

      <Section title="About">
        <Link to="/" className="block">
          <Row
            icon={Info}
            label="About Sikkanam"
            desc="A budget travel companion for Tamil Nadu"
          />
        </Link>

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
