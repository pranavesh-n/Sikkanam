import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  Sparkles,
  ArrowLeft,
  Share2,
  Calendar,
  Lock,
  Cloud,
  MapPin,
  Smartphone,
  Bot,
  Heart,
  CloudSun,
  Bus,
  Utensils,
  Palette,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import logo from "@/assets/logo.png";

interface ReleaseUpdate {
  title: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

interface MonthlyRelease {
  id: string;
  monthYear: string;
  version: string;
  tagline: string;
  updates: ReleaseUpdate[];
}

const MONTHLY_RELEASES: MonthlyRelease[] = [
  {
    id: "august-2026",
    monthYear: "August 2026",
    version: "v2.6.2",
    tagline: "Direct Link Sharing, Live 16-Day Weather & Authentic Google Branding",
    updates: [
      {
        title: "Direct Interactive Trip Link Sharing",
        category: "Sharing & Collaboration",
        description:
          "Share calculated trip plans directly via unique URLs! Travel partners can open shared links to instantly view itinerary details, budget breakdowns, and route maps.",
        icon: Share2,
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      {
        title: "16-Day Weather Horizon & User Choice Date Picker",
        category: "Weather & AI Insights",
        description:
          "Select any custom travel date range across the year with live 16-day Open-Meteo forecasts, hourly rain windows, and automated indoor attraction alternatives.",
        icon: Calendar,
        badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
      {
        title: "Official 4-Color Google Auth Branding",
        category: "Security & UI",
        description:
          "Upgraded Google Sign-in and Sign-up buttons with official multi-colored Google logo branding across all mobile and desktop authentication touchpoints.",
        icon: GoogleIcon,
        badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      },
      {
        title: "Cloud Firestore Real-Time Cross-Device Sync",
        category: "Cloud Sync",
        description:
          "Passcode security lock status, PIN credentials, saved itineraries, and wishlists sync instantly across PC and mobile web browsers in real time.",
        icon: Cloud,
        badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      },
    ],
  },
  {
    id: "july-2026",
    monthYear: "July 2026",
    version: "v2.5.0",
    tagline: "Interactive District Map & 4-Digit Passcode Lock",
    updates: [
      {
        title: "Interactive Tamil Nadu Map & Distance Calculator",
        category: "Maps & Routes",
        description:
          "Custom district map pin markers, route distance matrices, turn-by-turn estimates, and interactive Leaflet map overlays for all 38 districts.",
        icon: MapPin,
        badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      },
      {
        title: "4-Digit App Passcode Security Lock",
        category: "Privacy & Protection",
        description:
          "Protect your personal travel plans and wishlists with an optional 4-digit PIN lock, complete with biometric-feel overlay and Google auth reset fallback.",
        icon: Lock,
        badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
    ],
  },
  {
    id: "june-2026",
    monthYear: "June 2026",
    version: "v2.4.0",
    tagline: "Smart PWA Adoption & Enhanced AI Travel Engine",
    updates: [
      {
        title: "Smart Progressive Web App (PWA) Support",
        category: "Mobile Experience",
        description:
          "Install Sikkanam directly to your phone or desktop home screen with offline caching, 1-tap installation prompt, and standalone app experience.",
        icon: Smartphone,
        badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      },
      {
        title: "Sikkanam AI Travel Companion 2.0",
        category: "AI Travel Assistant",
        description:
          "Tailored AI itinerary generation for Solo, Couple, Family, and Friends group trips with realistic budget distribution and local travel tips.",
        icon: Bot,
        badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      },
    ],
  },
  {
    id: "may-2026",
    monthYear: "May 2026",
    version: "v2.2.0",
    tagline: "Wishlist Bookmarking & Live Weather Widget",
    updates: [
      {
        title: "Handpicked Wishlist & Saved Itineraries",
        category: "Personalization",
        description:
          "Bookmark top Tamil Nadu destinations, save multiple trip itinerary drafts, and manage customized budget limits per trip.",
        icon: Heart,
        badgeColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
      },
      {
        title: "Live Open-Meteo Weather Widget",
        category: "Weather Radar",
        description:
          "Real-time temperature, humidity, UV index, and weather forecasts integrated directly into destination pages and trip results.",
        icon: CloudSun,
        badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      },
    ],
  },
  {
    id: "april-2026",
    monthYear: "April 2026",
    version: "v2.0.0",
    tagline: "Multi-Transport Cost Calculator & Cuisine Guides",
    updates: [
      {
        title: "Multi-Transport Cost Estimator",
        category: "Budget Engine",
        description:
          "Comprehensive travel expense calculator comparing Bus, Train, Rental Cab, and Bike options with fuel and toll estimates across routes.",
        icon: Bus,
        badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
      },
      {
        title: "Authentic Local Cuisine & Heritage Guides",
        category: "Local Insights",
        description:
          "Curated local dishes, famous eateries, heritage landmarks, entry ticket costs, and seasonal festival schedules for Tamil Nadu travelers.",
        icon: Utensils,
        badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      },
    ],
  },
  {
    id: "march-2026",
    monthYear: "March 2026",
    version: "v1.5.0",
    tagline: "Glassmorphism UI Redesign & Saffron Aesthetic",
    updates: [
      {
        title: "Saffron Premium Aesthetic & Glassmorphism",
        category: "Design System",
        description:
          "Vibrant saffron gradient tokens, modern dark mode support, smooth micro-interactions, and refined typography built for seamless browsing.",
        icon: Palette,
        badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      },
    ],
  },
  {
    id: "february-2026",
    monthYear: "February 2026",
    version: "v1.0.0",
    tagline: "Official Sikkanam Platform Launch",
    updates: [
      {
        title: "Sikkanam Travel Planner Initial Release",
        category: "Platform Launch",
        description:
          "Launch of Tamil Nadu's dedicated budget travel planning platform connecting travelers with smart itineraries, local destination highlights, and cost transparency.",
        icon: Rocket,
        badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
    ],
  },
];

const WhatsNew: React.FC = () => {
  const [openMonth, setOpenMonth] = useState<string>("august-2026");

  const toggleMonth = (id: string) => {
    setOpenMonth((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/60">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Sikkanam Logo" className="w-8 h-8 rounded-xl object-cover shadow-sm" />
          <span className="font-display font-bold text-sm tracking-tight text-foreground">
            Sikkanam
          </span>
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs mb-3 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MONTHLY UPDATE LOG</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-foreground tracking-tight mb-3">
          What's New
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
          The latest features, updates, and continuous improvements brought to Sikkanam every month.
        </p>
      </div>

      {/* Accordion List of Monthly Releases */}
      <div className="space-y-4">
        {MONTHLY_RELEASES.map((release) => {
          const isOpen = openMonth === release.id;
          return (
            <div
              key={release.id}
              className="border border-border/80 rounded-2xl bg-card overflow-hidden shadow-sm transition-all"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleMonth(release.id)}
                className="w-full py-4 px-5 flex items-center justify-between text-left hover:bg-muted/40 transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-display font-extrabold text-lg md:text-xl text-foreground">
                    {release.monthYear}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-mono font-medium text-muted-foreground border border-border/60">
                    {release.version}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
                    {release.updates.length} {release.updates.length === 1 ? "update" : "updates"}
                  </span>
                  <div
                    className={`p-1.5 rounded-full bg-muted/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-border/40 animate-in fade-in duration-200 space-y-4">
                  <p className="text-xs md:text-sm text-primary font-medium italic">
                    "{release.tagline}"
                  </p>

                  <div className="grid grid-cols-1 gap-3.5">
                    {release.updates.map((update, idx) => {
                      const IconComponent = update.icon;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-border transition-colors text-left flex gap-3.5 items-start"
                        >
                          <div className="p-2.5 rounded-xl bg-card border border-border/60 shrink-0 text-primary shadow-xs">
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-bold text-sm md:text-base text-foreground">
                                {update.title}
                              </h3>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${update.badgeColor}`}
                              >
                                {update.category}
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                              {update.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsNew;
