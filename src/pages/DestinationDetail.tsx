import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getDestinationById, categoryLabels } from "@/data/tnDestinations";
import { Sparkles, MapPin, Train, Bus, Ticket, Cloud, Calendar, ArrowRight, Heart, Route } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/WeatherWidget";

const seasonByCat: Record<string, string> = {
  hill: "Apr – Jun (cool)",
  beach: "Oct – Mar (mild)",
  temple: "Oct – Feb (festivals)",
  city: "Nov – Feb",
  wildlife: "Nov – Mar",
  heritage: "Oct – Feb",
};

const budgetByCat = {
  hill: {
    budget: "₹2500–₹4500",
    comfortable: "₹4500–₹8000",
    premium: "₹8000+"
  },

  beach: {
    budget: "₹2000–₹4000",
    comfortable: "₹4000–₹7000",
    premium: "₹7000+"
  },

  temple: {
    budget: "₹1500–₹3500",
    comfortable: "₹3500–₹6000",
    premium: "₹6000+"
  },

  city: {
    budget: "₹2000–₹4500",
    comfortable: "₹4500–₹8000",
    premium: "₹8000+"
  },

  heritage: {
    budget: "₹2500–₹5000",
    comfortable: "₹5000–₹9000",
    premium: "₹9000+"
  },

  wildlife: {
    budget: "₹3000–₹5500",
    comfortable: "₹5500–₹9000",
    premium: "₹9000+"
  }
};

const DestinationDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const dest = id ? (getDestinationById(id) || getDestinationById(id.toLowerCase())) : undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (user && dest) {
      checkWishlistStatus();
    }
  }, [user, dest]);

  const checkWishlistStatus = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const list = data.wishlist || [];
        setIsWishlisted(list.includes(dest?.id));
      }
    } catch (err) {
      console.error("Error checking wishlist status:", err);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to add to wishlist");
      nav("/profile");
      return;
    }

    if (!dest) return;

    try {
      if (isWishlisted) {
        const res = await fetch(`/api/wishlist?destinationId=${dest.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setIsWishlisted(false);
          toast.success("Removed from wishlist");
          window.dispatchEvent(new CustomEvent("sikkanam:wishlist_updated"));
        } else {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destinationId: dest.id }),
        });
        if (res.ok) {
          setIsWishlisted(true);
          toast.success("Added to wishlist");
          window.dispatchEvent(new CustomEvent("sikkanam:wishlist_updated"));
        } else {
          toast.error("Failed to add to wishlist");
        }
      }
    } catch (err) {
      toast.error("Network error toggling wishlist");
    }
  };

  useEffect(() => {
    if (!dest || !mapRef.current || mapInstance.current) return;
    let cancelled = false;
    (async () => {
      try {
        const L = await import("leaflet");
        if (cancelled || !mapRef.current) return;
        if ((mapRef.current as any)._leaflet_id) {
          (mapRef.current as any)._leaflet_id = null;
        }
        // Fix default icon paths (Leaflet quirk)
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([dest.lat, dest.lng], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);
        L.marker([dest.lat, dest.lng]).addTo(map).bindPopup(`<b>${dest.name}</b><br/>${dest.district}`);
        mapInstance.current = map;
        setTimeout(() => map && map.invalidateSize && map.invalidateSize(), 200);
      } catch (e) {
        console.warn("Leaflet map load warning:", e);
      }
    })();
    return () => {
      cancelled = true;
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch (e) {}
        mapInstance.current = null;
      }
    };
  }, [dest]);

  if (!dest) {
    return (
      <div className="px-6 py-12 text-center max-w-md mx-auto">
        <p className="text-muted-foreground">Destination not found.</p>
        <Link to="/explore" className="text-primary text-sm font-medium mt-2 inline-block">Back to Explore</Link>
      </div>
    );
  }

  const askAI = () => {
    nav("/ai", { state: { prompt: `Plan a 2-day budget trip to ${dest.name} from Chennai under ₹5000` } });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 md:pt-6 pb-12 space-y-6">
      {/* Hero */}
      <section className="relative h-52 sm:h-64 gradient-saffron overflow-hidden rounded-2xl md:rounded-3xl shadow-card">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleWishlist}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-all shadow-md border border-white/10"
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 stroke-red-500" : "stroke-white"}`} />
          </button>
        </div>
        <div className="absolute inset-0 flex items-end p-5 sm:p-7 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div>
            <span className="text-4xl sm:text-5xl block">{dest.emoji}</span>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white mt-1">{dest.name}</h1>
            <p className="text-white/90 text-xs sm:text-sm font-medium">{dest.district} · {categoryLabels[dest.category]}</p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section>
        <p className="text-sm sm:text-base text-foreground leading-relaxed bg-card p-4 sm:p-5 rounded-2xl border border-border/80 shadow-xs">{dest.description}</p>
      </section>

      {/* Budget Estimates */}
      <section>
        <h2 className="font-display font-bold text-base sm:text-lg mb-3">
          Approximate Budget
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs">
            <p className="font-semibold text-sm text-foreground">
              🎒 Budget Trip
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {budgetByCat[dest.category]?.budget}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs">
            <p className="font-semibold text-sm text-foreground">
              🧳 Comfortable Trip
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {budgetByCat[dest.category]?.comfortable}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs">
            <p className="font-semibold text-sm text-foreground">
              ✨ Premium Trip
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {budgetByCat[dest.category]?.premium}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-2">
          * Prices are approximate and may vary based on season, accommodation, and transportation mode.
        </p>
      </section>

      {/* Stat row */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <Stat icon={Calendar} label="Best season" value={seasonByCat[dest.category] || "Year-round"} />
        <Stat icon={Cloud} label="Weather" value={dest.category === "hill" ? "Cool" : dest.category === "beach" ? "Warm" : "Mild"} />
        <Stat icon={Ticket} label="Budget" value={budgetByCat[dest.category]?.budget || "₹1,500/day"} />
      </section>

      {/* Live Weather Forecast & Sikkanam AI Rain Risk System */}
      <section>
        <WeatherWidget
          lat={dest.lat}
          lng={dest.lng}
          destinationId={dest.id}
          destinationName={dest.name}
          category={dest.category}
        />
      </section>

      {/* AI CTA */}
      <section>
        <button
          onClick={askAI}
          className="w-full flex items-center justify-between gap-3.5 gradient-saffron text-primary-foreground rounded-2xl px-5 py-4 shadow-elevated active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0" />
            <span className="text-sm sm:text-base font-bold text-left">Ask Sikkanam AI to plan a trip to {dest.name}</span>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </section>

      {/* Attractions */}
      <section>
        <h2 className="font-display font-bold text-base sm:text-lg mb-3">Top attractions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {dest.attractions.map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 text-sm flex items-center gap-3 shadow-xs">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{i + 1}</span>
              <span className="font-medium text-foreground">{a}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Transport */}
      <section>
        <h2 className="font-display font-bold text-base sm:text-lg mb-3">Getting there</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dest.nearestStation && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 shadow-xs">
              <Train className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Nearest railway station</p>
                <p className="text-xs text-muted-foreground truncate">{dest.nearestStation}</p>
              </div>
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 shadow-xs">
            <Bus className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">TNSTC bus services</p>
              <p className="text-xs text-muted-foreground truncate">Frequent state buses from major cities</p>
            </div>
            <Link to="/booking" className="text-xs text-primary font-medium shrink-0">Book →</Link>
          </div>
          {dest.localTransit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3 sm:col-span-2 shadow-xs">
              <Route className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Local Transit & First / Last Mile</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{dest.localTransit}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Map */}
      <section>
        <h2 className="font-display font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Location
        </h2>
        <div ref={mapRef} className="h-60 sm:h-72 rounded-2xl overflow-hidden border border-border bg-muted shadow-xs" />
        <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
          <p className="text-[11px] text-muted-foreground">© OpenStreetMap contributors</p>
          <Link
            to={`/maps?destination=${dest.id}`}
            className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
          >
            <Route className="w-3.5 h-3.5" /> Calculate Exact Route & Fares →
          </Link>
        </div>
      </section>

      {/* Travel tips */}
      <section>
        <h2 className="font-display font-bold text-base sm:text-lg mb-3">Quick tips</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {dest.transitTips?.map((tip, idx) => (
            <div key={`transit-tip-${idx}`} className="bg-card border border-primary/20 bg-primary/[0.02] rounded-xl p-3 text-xs sm:text-sm text-foreground">
              🚌 {tip}
            </div>
          ))}
          <div className="bg-card border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground">💰 Carry cash — UPI works in towns, not always in remote spots.</div>
          <div className="bg-card border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground">🚌 TNSTC buses are the cheapest option (~₹1–₹1.5/km).</div>
          <div className="bg-card border border-border rounded-xl p-3 text-xs sm:text-sm text-foreground">🍛 Try authentic local mess meals (~₹80–₹140).</div>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="bg-card border border-border rounded-xl p-2.5 text-center">
    <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
    <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
    <p className="text-[11px] font-semibold mt-0.5 leading-tight">{value}</p>
  </div>
);

export default DestinationDetail;
