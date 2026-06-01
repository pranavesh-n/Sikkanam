import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { tnDestinations, type DestinationCategory } from "@/data/tnDestinations";
import DestinationCard from "@/components/DestinationsCard";

const cats: { value: DestinationCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hill", label: "🏔️ Hills" },
  { value: "beach", label: "🏖️ Beach" },
  { value: "temple", label: "🛕 Temple" },
  { value: "city", label: "🏙️ City" },
  { value: "wildlife", label: "🌿 Wildlife" },
  { value: "heritage", label: "🏛️ Heritage" },
];

const Explore = () => {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("cat") as DestinationCategory) || "all";
  const [active, setActive] = useState<DestinationCategory | "all">(initial);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (active === "all") params.delete("cat");
    else params.set("cat", active);
    setParams(params, { replace: true });
  }, [active]);

  const filtered = useMemo(() => {
    return tnDestinations.filter(d => {
      if (active !== "all" && d.category !== active) return false;
      if (q && !`${d.name} ${d.district} ${d.fullName}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [active, q]);

  return (
    <div className="max-w-md md:max-w-6xl mx-auto px-4 md:px-6 pt-2 md:pt-8 pb-6">
      {/* Page heading (desktop) */}
      <div className="hidden md:block mb-6">
        <h1 className="font-display text-3xl font-extrabold">Explore Tamil Nadu</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hand-picked destinations across hills, beaches, temples, wildlife and heritage.
        </p>
      </div>
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search destinations..."
          className="w-full pl-9 pr-4 py-3 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter pills */}
      <div className="mt-4 mb-5">
  <button
    onClick={() => window.open("/maps", "_blank")}
    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-card hover:opacity-90 transition"
  >
    🗺️ View in Maps
  </button>
</div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {cats.map(c => (
          <button
            key={c.value}
            onClick={() => setActive(c.value)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              active === c.value
                ? "gradient-saffron text-primary-foreground shadow-card"
                : "bg-card border border-border text-muted-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 mb-2">{filtered.length} destinations</p>
<div className="mb-5">
</div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((d) => (
  <DestinationCard
    key={d.id}
    place={d}
  />
))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No destinations match. Try a different search.
        </div>
      )}
    </div>
  );
};

export default Explore;
