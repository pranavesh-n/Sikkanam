import { forwardRef } from "react";
import { type TripPlan, generateShareText } from "@/lib/tripPlanner";
import { categoryLabels, getDestinationById } from "@/data/tnDestinations";
import { Share2, Printer, Map, Train, Bus, Car, Star, Utensils, Building2, Navigation, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { generateTrainSearchUrl } from "@/lib/utils";
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

  const handleTrainSearch = () => {
    const trainLegs = plan.route.filter(leg => leg.mode === "train");
    if (trainLegs.length > 0) {
      const firstTrainLeg = trainLegs[0];
      const fromStation = firstTrainLeg.fromStation || firstTrainLeg.from;
      const toStation = firstTrainLeg.toStation || firstTrainLeg.to;
      const url = generateTrainSearchUrl(fromStation, toStation);
      window.open(url, "_blank");
    }
  };

  const getTrainSearchUrl = () => {
    const srcDest = getDestinationById(plan.input.source);
    const fromStation = srcDest?.nearestStation || plan.input.source;
    const toStation = plan.destination.nearestStation || plan.destination.name;
    return generateTrainSearchUrl(fromStation, toStation);
  };

  const hasTrainLegs = plan.route.some(leg => leg.mode === "train");
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
                  <p className="font-medium text-foreground">
                    {leg.mode === "train" && leg.fromStation && leg.toStation
                      ? `${leg.fromStation} (${leg.from}) → ${leg.toStation} (${leg.to})`
                      : `${leg.from} → ${leg.to}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{leg.mode.toUpperCase()} · {leg.distanceKm} km · {leg.duration}{leg.frequency ? ` · ${leg.frequency}` : ""}</p>
                  {leg.note && <p className="text-xs text-muted-foreground mt-1">{leg.note}</p>}
                </div>
                <span className="font-bold text-primary">₹{leg.costPerPerson}/pp</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Railway Journey */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6 border border-border/40 hover:shadow-elevated transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          
          <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            Suggested Railway Journey
          </h3>
          
          {plan.destination.hasRailAccess ? (
            <div className="space-y-3">
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                🚆 Direct Train Available
              </p>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Nearest station:</p>
                <p className="font-display font-bold text-foreground text-lg">{plan.destination.nearestStation}</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You can directly search trains to this station.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">
                🚆 Train to {plan.destination.nearestStation}
              </p>
              
              <p className="text-sm text-foreground">
                This destination does not have direct railway access.
              </p>
              
              <p className="text-sm text-muted-foreground">
                Travel by train to <span className="font-semibold text-foreground">{plan.destination.nearestStation}</span> and continue by bus or taxi.
              </p>
            </div>
          )}
          
          <div className="mt-5 pt-4 border-t border-border/60">
            <button
              onClick={() => window.open(getTrainSearchUrl(), "_blank")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
            >
              <Train className="w-4 h-4" />
              <span>🚆 Check Available Trains</span>
              <ExternalLink className="w-4 h-4" />
            </button>
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
          {(() => {
            const nights = Math.max(plan.input.days - 1, 0);
            if (nights === 0) {
              return (
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  Day trip detected. No hotel stay required.
                </div>
              );
            }
            if (plan.hotels.length === 0) {
              return (
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                  No nearby hotels were found for this destination. Accommodation budget estimates are still included.
                </div>
              );
            }
            const bestHotels = plan.hotels.slice(0, 3);
            return (
              <div className="grid gap-3">
                {bestHotels.map((hotel, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:shadow-card transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{hotel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof hotel.distanceKm === 'number' ? (hotel.distanceKm === 0 ? 'At centre' : `${hotel.distanceKm} km from centre`) : 'Distance unknown'} · {hotel.tier} · {" "}
                        {HOTEL_RANGES[hotel.priceCategory].min <= plan.budget.hotelPerNight * 1.15 ? (
                          <span className="text-emerald-600 font-semibold dark:text-emerald-400">Fits Your Budget</span>
                        ) : (
                          <span className="text-amber-600 font-semibold dark:text-amber-400">Stretch Budget</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          <Star className="w-3 h-3 fill-primary text-primary inline mr-1" /> {hotel.rating}
                        </span>
                        <span className="text-xs font-semibold text-primary">
                          ₹{HOTEL_RANGES[hotel.priceCategory].min}–₹{HOTEL_RANGES[hotel.priceCategory].max}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const query = hotel.name.includes("Search hotels")
                            ? plan.destination.name
                            : `${hotel.name}, ${plan.destination.name}`;
                          window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(query)}`, "_blank");
                        }}
                        className="mt-2 text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
                      >
                        💳 Check Live Price
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
