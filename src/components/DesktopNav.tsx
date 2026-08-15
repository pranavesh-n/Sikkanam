import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Sparkles, User, LogOut, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/plan", label: "Plan" },
  { to: "/booking", label: "Book" },
  { to: "/profile", label: "Profile" },
];

const DesktopNav = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-card shrink-0">
              <img src={logo} alt="Sikkanam" className="w-full h-full object-cover scale-[1.08]" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">
              Sikkanam
            </span>
            <span className="text-[10px] text-muted-foreground hidden lg:inline ml-1">
              · Tamil Nadu
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {/* Moved "Ask Sikkanam AI" button to left near profile navigation links */}
            <Link
              to="/ai"
              className="inline-flex items-center gap-1.5 gradient-saffron text-primary-foreground rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-card hover:opacity-95 active:scale-95 transition-all ml-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Sikkanam AI</span>
            </Link>
          </nav>
        </div>

        {/* Right Side: Logged-in Profile Dropdown OR Sign In / Sign Up Button */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged-In User Profile Dropdown Button */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-muted/80 border border-border/60 transition-all focus:outline-none cursor-pointer"
              >
                {user.avatar && !avatarError ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500/30"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold text-xs grid place-items-center shadow-xs">
                    {getInitial(user.name)}
                  </div>
                )}
                <span className="font-semibold text-sm text-foreground max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Floating Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-border/80 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
                  {/* Header: User Info */}
                  <div className="px-4 py-3 border-b border-border/60">
                    <div className="font-bold text-sm text-foreground truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted/60 flex items-center gap-2.5 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-destructive" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged-Out State: Sign in / Sign up Button */
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-saffron text-white font-bold text-xs shadow-card active:scale-95 transition-all cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-0.5 shadow-xs">
                <GoogleIcon className="w-3 h-3" />
              </div>
              <span>Sign in / Sign up</span>
            </button>
          )}
        </div>
      </div>

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default DesktopNav;
