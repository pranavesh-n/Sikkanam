import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import logo from "@/assets/logo.png";

const titles: Record<string, string> = {
  "/explore": "Explore",
  "/ai": "Sikkanam AI",
  "/booking": "Booking",
  "/profile": "Profile",
  "/plan": "Plan a Trip",
};

const TopBar = () => {
  const nav = useNavigate();
  const { pathname } = useLocation();

  let title = titles[pathname];
  if (!title && pathname.startsWith("/destination/")) title = "Destination";
  if (!title) title = "Sikkanam";

  return (
    <header
      className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-md mx-auto h-14 flex items-center px-2 gap-1">
        <button
          onClick={() => nav(-1)}
          aria-label="Back"
          className="w-10 h-10 grid place-items-center rounded-full text-foreground hover:bg-muted active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <img src={logo} alt="" className="w-7 h-7 rounded-lg" />
        <h1 className="font-display font-bold text-base">{title}</h1>
      </div>
    </header>
  );
};

export default TopBar;
