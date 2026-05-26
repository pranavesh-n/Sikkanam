import { NavLink } from "react-router-dom";
import { Home, Compass, Sparkles, Ticket, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/ai", label: "AI", icon: Sparkles, accent: true },
  { to: "/booking", label: "Book", icon: Ticket },
  { to: "/profile", label: "You", icon: User },
];

const BottomNav = () => {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/60"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {tabs.map((t) => (
          <li key={t.to} className="flex">
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? t.accent
                      ? "text-primary"
                      : "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-full transition-all ${
                      isActive && t.accent
                        ? "gradient-saffron text-primary-foreground shadow-card scale-105"
                        : isActive
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <t.icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
