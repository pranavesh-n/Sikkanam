import { forwardRef } from "react";
import { type TripPlan, generateShareText } from "@/lib/tripPlanner";
import { categoryLabels } from "@/data/destinations";
import { Share2, Printer, Map, Train, Bus, Car, Star, Utensils, Building2, Navigation, AlertCircle, CheckCircle2 } from "lucide-react";

interface TripResultsProps {
  plan: TripPlan;
}

const TripResults = forwardRef<HTMLDivElement, TripResultsProps>(({ plan }, ref) => {
  const modeIcon = (mode: string) => {
    switch (mode) {
      case "train": return <Train className="w-4 h-4" />;
      case "auto": return <Car className="w-4 h-4" />;
      default: return <Bus className="w-4 h-4" />;
    }
  };

  const handleWhatsAppShare = () => {
    const text = generateShareText(plan);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };
  const handleOpenMaps = () => {
  const destination = plan.destination.id;
  window.open(`/maps?destination=${destination}`, "_blank");
};
  const budgetItems = [
    { label: "Transport", value: plan.budget.transport, target: plan.budget.transportTarget, icon: <Navigation className="w-4 h-4" /> },
    { label: "Hotel share", value: plan.budget.hotel, target: plan.budget.hotelTarget, icon: <Building2 className="w-4 h-4" /> },
    { label: "Food", value: plan.budget.food, target: plan.budget.foodTarget, icon: <Utensils className="w-4 h-4" /> },
    { label: "Local share", value: plan.budget.local, target: plan.budget.localTarget, icon: <Map className="w-4 h-4" /> },
  ];

  return (
    <section ref={ref} className="py-16 md:py-24 print:py-4">
      <div className="container max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mb-3">
            {categoryLabels[plan.destination.category]}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Your Trip to {plan.destination.name}
          </h2>
          <p className="text-muted-foreground">
            {plan.input.days} Days · {plan.input.travellers} Travellers · {plan.input.style.charAt(0).toUpperCase() + plan.input.style.slice(1)} Style
          </p>
        </div>

        {/* Share buttons */}
        <div className="flex justify-center gap-3 mb-10 print:hidden">
          <button onClick={handleWhatsAppShare} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
            <Printer className="w-4 h-4" /> Print / PDF
          </button>
          <button
  onClick={handleOpenMaps}
  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors"
>
  🗺️ Open in Maps
</button>
        </div>

        {/* Route */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">🚌 Optimized Route</h3>
          <div className="space-y-3">
            {plan.route.map((leg, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                <div className="w-10 h-10 rounded-full gradient-saffron flex items-center justify-center text-primary-foreground">
                  {modeIcon(leg.mode)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{leg.from} → {leg.to}</p>
                  <p className="text-sm text-muted-foreground">{leg.mode.toUpperCase()} · {leg.distanceKm} km · {leg.duration}{leg.frequency ? ` · ${leg.frequency}` : ""}</p>
                  {leg.note && <p className="text-xs text-muted-foreground mt-1">{leg.note}</p>}
                </div>
                <span className="font-bold text-primary">₹{leg.costPerPerson}/pp</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-6 flex-col md:flex-row md:items-center">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">💰 Budget Breakdown</h3>
              <p className="text-sm text-muted-foreground">Per person budget ₹{plan.budget.perPerson.toLocaleString("en-IN")} · Group total ₹{plan.budget.total.toLocaleString("en-IN")}</p>
            </div>

            <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${plan.budget.status === "within" ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive"}`}>
              {plan.budget.status === "within" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {plan.budget.status === "within"
                ? `Fits budget · ₹${plan.budget.remaining.toLocaleString("en-IN")} left`
                : `Over budget · ₹${Math.abs(plan.budget.remaining).toLocaleString("en-IN")}`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4">
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Estimated total</p>
              <p className="text-2xl font-display font-bold text-primary">₹{plan.budget.estimatedTotal.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Hotel target / night</p>
              <p className="text-xl font-display font-bold text-foreground">₹{plan.budget.hotelPerNight.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Rooms needed</p>
              <p className="text-xl font-display font-bold text-foreground">{plan.budget.rooms || 0}</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground mb-1">Trip style</p>
              <p className="text-xl font-display font-bold text-foreground capitalize">{plan.input.style}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {budgetItems.map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-center mb-2 text-muted-foreground">{item.icon}</div>
                <p className="text-lg font-bold text-foreground">₹{item.value.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Target ₹{item.target.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          {/* Simple bar chart */}
          <div className="mt-6 h-4 rounded-full overflow-hidden flex">
            <div className="gradient-saffron" style={{ width: `${(plan.budget.transport / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Transport" />
            <div className="gradient-teal" style={{ width: `${(plan.budget.hotel / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Hotel" />
            <div className="bg-muted-foreground/30" style={{ width: `${(plan.budget.food / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Food" />
            <div className="bg-muted-foreground/15" style={{ width: `${(plan.budget.local / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Local" />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Transport</span>
            <span>Hotels</span>
            <span>Food</span>
            <span>Local</span>
          </div>
        </div>

        {/* Hotels */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">🏨 Recommended Hotels</h3>
          {plan.hotels.length === 0 ? (
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              This looks like a day-trip style plan, so Sikkanam skips hotel recommendations to keep the budget efficient.
            </div>
          ) : (
            <div className="grid gap-3">
              {plan.hotels.map((hotel, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:shadow-card transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{hotel.name}</p>
                  <p className="text-sm text-muted-foreground">{hotel.distanceKm} km from centre · {hotel.tier} · target-friendly {hotel.pricePerNight <= plan.budget.hotelPerNight * 1.15 ? "yes" : "stretch"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">₹{hotel.pricePerNight}/night</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 fill-primary text-primary" /> {hotel.rating}
                  </p>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Attractions */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">📍 Must-Visit Attractions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {plan.attractions.map((attr, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 text-sm text-foreground">
                <span className="text-primary">•</span> {attr}
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">🗓️ Day-by-Day Itinerary</h3>
          <div className="space-y-4">
            {plan.itinerary.map((day) => (
              <div key={day.day} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display font-bold text-foreground">{day.title}</h4>
                  <span className="text-sm font-medium text-primary">~₹{day.estimatedCost}</span>
                </div>
                <ul className="space-y-1.5 mb-3">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-secondary mt-0.5">▸</span> {activity}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground border-t border-border pt-2">
                  🍽️ {day.meals}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-muted/50 rounded-2xl p-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4">💡 Travel Tips</h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold">→</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
});

TripResults.displayName = "TripResults";

export default TripResults;
