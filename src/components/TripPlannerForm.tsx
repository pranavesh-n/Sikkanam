import { useState, forwardRef } from "react";
import { tnDestinations } from "@/data/tnDestinations";
import { type TripInput, type TravelStyle } from "@/lib/tripPlanner";
import { MapPin, Users, Calendar, Wallet, Compass } from "lucide-react";

interface TripPlannerFormProps {
  onGenerate: (input: TripInput) => void;
}

const TripPlannerForm = forwardRef<HTMLDivElement, TripPlannerFormProps>(({ onGenerate }, ref) => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(2);
  const [travellers, setTravellers] = useState(2);
  const [style, setStyle] = useState<TravelStyle>("standard");
  const [budget, setBudget] = useState(5000);
  const [error, setError] = useState("");

  const sortedDestinations = [...tnDestinations].sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) {
      setError("Please select both source and destination");
      return;
    }
    if (source === destination) {
      setError("Source and destination cannot be the same");
      return;
    }
    setError("");
    onGenerate({ source, destination, days, travellers, style, budget });
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
                <option value="">Select destination</option>
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

          {/* Days & Travellers */}
          <div className="grid grid-cols-2 gap-4">
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
              min={1000}
              max={25000}
              step={500}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>₹1,000</span>
              <span>₹25,000</span>
            </div>
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
