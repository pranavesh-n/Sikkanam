import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { getDestinationById, categoryLabels } from "@/data/tnDestinations";
import { Sparkles, MapPin, Train, Bus, Ticket, Cloud, Calendar, ArrowRight } from "lucide-react";

const seasonByCat: Record<string, string> = {
  hill: "Apr – Jun (cool)",
  beach: "Oct – Mar (mild)",
  temple: "Oct – Feb (festivals)",
  city: "Nov – Feb",
  wildlife: "Nov – Mar",
  heritage: "Oct – Feb",
};

const budgetByCat: Record<string, string> = {
  hill: "₹1,500–₹3,500/day",
  beach: "₹1,200–₹3,000/day",
  temple: "₹800–₹2,000/day",
  city: "₹1,500–₹4,000/day",
  wildlife: "₹2,000–₹4,500/day",
  heritage: "₹1,000–₹2,500/day",
};

const DestinationDetail = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const dest = id ? getDestinationById(id) : undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!dest || !mapRef.current || mapInstance.current) return;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;
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
      setTimeout(() => map.invalidateSize(), 200);
    })();
    return () => { cancelled = true; mapInstance.current?.remove(); mapInstance.current = null; };
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
    <div className="max-w-md md:max-w-5xl mx-auto md:px-6 md:pt-6 pb-6">
      {/* Hero */}
      <section className="relative h-48 gradient-saffron overflow-hidden">
        <div className="absolute inset-0 flex items-end p-5">
          <div>
            <span className="text-5xl block">{dest.emoji}</span>
            <h1 className="font-display text-3xl font-extrabold text-primary-foreground mt-1">{dest.name}</h1>
            <p className="text-primary-foreground/90 text-sm">{dest.district} · {categoryLabels[dest.category]}</p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="px-5 pt-5">
        <p className="text-sm text-foreground leading-relaxed">{dest.description}</p>
      </section>

      {/* Stat row */}
      <section className="px-5 mt-4 grid grid-cols-3 gap-2">
        <Stat icon={Calendar} label="Best season" value={seasonByCat[dest.category] || "Year-round"} />
        <Stat icon={Cloud} label="Weather" value={dest.category === "hill" ? "Cool" : dest.category === "beach" ? "Warm" : "Mild"} />
        <Stat icon={Ticket} label="Budget" value={budgetByCat[dest.category] || "₹1,500/day"} />
      </section>

      {/* AI CTA */}
      <section className="px-5 mt-4">
        <button
          onClick={askAI}
          className="w-full flex items-center gap-3 gradient-saffron text-primary-foreground rounded-2xl px-4 py-3.5 shadow-elevated active:scale-[0.98] transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold flex-1 text-left">Ask AI to plan a trip here</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Attractions */}
      <section className="px-5 mt-6">
        <h2 className="font-display font-bold mb-3">Top attractions</h2>
        <div className="space-y-2">
          {dest.attractions.map((a, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-4 py-3 text-sm flex items-center gap-3">
              <span className="w-7 h-7 grid place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
              {a}
            </div>
          ))}
        </div>
      </section>

      {/* Transport */}
      <section className="px-5 mt-6">
        <h2 className="font-display font-bold mb-3">Getting there</h2>
        <div className="space-y-2">
          {dest.nearestStation && (
            <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <Train className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Nearest railway station</p>
                <p className="text-xs text-muted-foreground">{dest.nearestStation}</p>
              </div>
            </div>
          )}
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <Bus className="w-5 h-5 text-secondary mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">TNSTC bus services</p>
              <p className="text-xs text-muted-foreground">Frequent state buses from major cities</p>
            </div>
            <Link to="/booking" className="text-xs text-primary font-medium">Book →</Link>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="px-5 mt-6">
        <h2 className="font-display font-bold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Location
        </h2>
        <div ref={mapRef} className="h-56 rounded-2xl overflow-hidden border border-border bg-muted" />
        <p className="text-[11px] text-muted-foreground mt-2">© OpenStreetMap contributors</p>
      </section>

      {/* Travel tips */}
      <section className="px-5 mt-6">
        <h2 className="font-display font-bold mb-3">Quick tips</h2>
        <ul className="space-y-2 text-sm text-foreground">
          <li className="bg-card border border-border rounded-xl p-3">💰 Carry cash — UPI works in towns, not always in remote spots.</li>
          <li className="bg-card border border-border rounded-xl p-3">🚌 TNSTC buses are the cheapest option (₹1–₹2/km).</li>
          <li className="bg-card border border-border rounded-xl p-3">🍛 Try local meals (~₹80–₹150) before tourist restaurants.</li>
        </ul>
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
