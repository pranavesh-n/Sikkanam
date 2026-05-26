import { NavLink, Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/plan", label: "Plan" },
  { to: "/booking", label: "Book" },
  { to: "/profile", label: "Profile" },
];

const DesktopNav = () => {
  return (
    <header className="hidden md:block sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto h-16 px-6 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Sikkanam" className="w-9 h-9 rounded-xl shadow-card object-cover" />
          <span className="font-display font-extrabold text-lg tracking-tight">
            Sikkanam
          </span>
          <span className="text-[10px] text-muted-foreground hidden lg:inline ml-1">
            · Tamil Nadu
          </span>
        </Link>

        <nav className="flex items-center gap-1 ml-2">
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
        </nav>

        <div className="flex-1" />

        <Link
          to="/ai"
          className="inline-flex items-center gap-2 gradient-saffron text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold shadow-card hover:opacity-95 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Ask Sikkanam AI
        </Link>
      </div>
    </header>
  );
};

export default DesktopNav;
