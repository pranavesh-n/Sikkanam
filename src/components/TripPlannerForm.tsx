import { useState, forwardRef, useEffect, useRef } from "react";
import { tnDestinations } from "@/data/tnDestinations";
import { type TripInput, type TravelStyle, type TravellerType } from "@/lib/tripPlanner";
import { CATEGORY_PRICING } from "@/data/categoryPricing";
import { MapPin, Users, Calendar, Wallet, Compass } from "lucide-react";

const getDistance = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

const calculateBudgetRange = (
  days: number,
  travellers: number,
  style: TravelStyle,
  source: string,
  destination: string
) => {
  // 1. Distance estimation
  let distance = 200; // default average distance
  const srcDest = tnDestinations.find((d) => d.id === source);
  const dstDest = tnDestinations.find((d) => d.id === destination);
  if (srcDest && dstDest) {
    distance = getDistance(srcDest.lat, srcDest.lng, dstDest.lat, dstDest.lng);
  }

  // Find destination category pricing
  const category = dstDest?.category || "city";
  const pricing = CATEGORY_PRICING[category] || CATEGORY_PRICING.city;

  // 2. Transport cost per person (round trip)
  let transportMin = 0;
  let transportMax = 0;
  if (distance > 0) {
    if (style === "budget") {
      transportMin = Math.max(150, Math.round(distance * 0.8 * 2));
      transportMax = Math.max(300, Math.round(distance * 1.3 * 2));
    } else if (style === "comfort") {
      transportMin = Math.max(600, Math.round(distance * 2.0 * 2));
      transportMax = Math.max(1200, Math.round(distance * 3.5 * 2));
    } else { // standard
      transportMin = Math.max(300, Math.round(distance * 1.2 * 2));
      transportMax = Math.max(600, Math.round(distance * 2.0 * 2));
    }
  }

  // 3. Stay cost per person
  const nights = Math.max(days - 1, 0);
  const rooms = nights > 0 ? Math.ceil(travellers / (style === "budget" ? 3 : 2)) : 0;
  let hotelRange = pricing.hotelStandard;
  if (style === "budget") hotelRange = pricing.hotelBudget;
  else if (style === "comfort") hotelRange = pricing.hotelPremium;

  const hotelMin = (hotelRange[0] * rooms * nights) / travellers;
  const hotelMax = (hotelRange[1] * rooms * nights) / travellers;

  // 4. Food cost per person
  const foodMin = pricing.food[0] * days;
  const foodMax = pricing.food[1] * days;

  // 5. Local Travel & Activities per person
  const localMin = pricing.local[0] * days;
  const localMax = pricing.local[1] * days;

  // 6. Buffer per person
  const bufferMin = 250 * days;
  const bufferMax = 500 * days;

  // Totals
  const totalMin = transportMin + hotelMin + foodMin + localMin + bufferMin;
  const totalMax = transportMax + hotelMax + foodMax + localMax + bufferMax;

  // Round to nearest 500
  const roundedMin = Math.max(1000, Math.round(totalMin / 500) * 500);
  const roundedMax = Math.max(roundedMin + 1000, Math.round(totalMax / 500) * 500);

  return { min: roundedMin, max: roundedMax };
};

interface TripPlannerFormProps {
  onGenerate: (input: TripInput) => void;
}

const TripPlannerForm = forwardRef<HTMLDivElement, TripPlannerFormProps>(({ onGenerate }, ref) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(2);
  const [travellers, setTravellers] = useState(2);
  const [style, setStyle] = useState<TravelStyle>("standard");
  const [budgetRange, setBudgetRange] = useState({ min: 1000, max: 25000 });
  const [budget, setBudget] = useState(5000);
  const [travellerType, setTravellerType] = useState<TravellerType>("family");
  const [error, setError] = useState("");

  const prevMajorParams = useRef({ days, travellers, style });

  useEffect(() => {
    const range = calculateBudgetRange(days, travellers, style, source, destination);
    setBudgetRange(range);

    const majorChanged =
      prevMajorParams.current.days !== days ||
      prevMajorParams.current.travellers !== travellers ||
      prevMajorParams.current.style !== style;

    if (majorChanged) {
      const defaultValue = Math.round((range.min + (range.max - range.min) * 0.45) / 500) * 500;
      setBudget(defaultValue);
      prevMajorParams.current = { days, travellers, style };
    } else {
      setBudget((prev) => Math.min(Math.max(prev, range.min), range.max));
    }
  }, [days, travellers, style, source, destination]);

  const sortedDestinations = [...tnDestinations].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source) {
      setError("Please select a source");
      return;
    }
    if (destination !== "" && source === destination) {
      setError("Source and destination cannot be the same");
      return;
    }
    setError("");
    onGenerate({ source, destination, days, travellers, style, budget, travellerType });
  };

  const styleOptions: { value: TravelStyle; label: string; emoji: string }[] = [
    { value: "budget", label: "Ultra Budget", emoji: "🎒" },
    { value: "standard", label: "Standard", emoji: "🧳" },
    { value: "comfort", label: "Comfort", emoji: "✨" },
  ];

  return (
    <section ref={ref} id="planner" className="py-16 md:py-24">
      <div className="container max-w-3xl px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Plan Your Trip
          </h2>
              <p className="text-muted-foreground">Fill in the details — we’ll handle the rest</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-elevated p-6 md:p-8 space-y-6">
          {/* Source & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 text-primary" /> From
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">Select source</option>
                {sortedDestinations.map((d) => (
  <option key={d.id} value={d.id}>
    {d.name}
  </option>
))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 text-secondary" /> To
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">🔮 Help Me Choose! (Recommend Destinations)</option>
                {sortedDestinations
  .filter((d) => d.id !== source)
  .map((d) => (
    <option key={d.id} value={d.id}>
      {d.name}
    </option>
))}
              </select>
            </div>
          </div>

          {/* Days & Travellers & Traveller Profile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" /> Days
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <option key={d} value={d}>{d} {d === 1 ? "Day" : "Days"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 text-primary" /> Travellers
              </label>
              <select
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(t => (
                  <option key={t} value={t}>{t} {t === 1 ? "Person" : "People"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Users className="w-4 h-4 text-primary" /> Traveller Profile
              </label>
              <select
                value={travellerType}
                onChange={(e) => setTravellerType(e.target.value as TravellerType)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="solo">🎒 Solo Traveller</option>
                <option value="couple">💑 Couple</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="friends">👥 Friends Group</option>
                <option value="seniors">👵 Senior Citizens</option>
              </select>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
              <Compass className="w-4 h-4 text-primary" /> Travel Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {styleOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStyle(opt.value)}
                  className={`px-4 py-3 rounded-xl border-2 text-center transition-all duration-200 font-medium ${
                    style === opt.value
                      ? "border-primary bg-primary/10 text-foreground shadow-card"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl block mb-1">{opt.emoji}</span>
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Slider */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-foreground mb-3">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" /> Budget Per Person
              </span>
              <span className="text-lg font-bold text-primary">₹{budget.toLocaleString("en-IN")}</span>
            </label>
            <input
              type="range"
              min={budgetRange.min}
              max={budgetRange.max}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹{budgetRange.min.toLocaleString("en-IN")}</span>
              <span>₹{budgetRange.max.toLocaleString("en-IN")}</span>
            </div>
            {/* Context tag for the chosen budget */}
            <p className="text-[11px] text-muted-foreground mt-2 italic text-left">
              {budget <= budgetRange.min + (budgetRange.max - budgetRange.min) * 0.3 ? (
                "🎒 Economical / Backpacker style — fits tight budgets with basic stays and public buses."
              ) : budget >= budgetRange.min + (budgetRange.max - budgetRange.min) * 0.7 ? (
                "✨ Premium style — covers comfortable private transport and top-tier stays."
              ) : (
                "🧳 Balanced style — covers standard hotel rooms, restaurant meals, and sightseeing."
              )}
            </p>
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            className="w-full gradient-saffron text-primary-foreground py-4 rounded-xl font-display font-semibold text-lg shadow-card hover:shadow-elevated transition-shadow duration-200"
          >
            Generate Travel Plan 🗺️
          </button>
        </form>
      </div>
    </section>
  );
});

TripPlannerForm.displayName = "TripPlannerForm";

export default TripPlannerForm;
