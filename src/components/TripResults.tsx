import { forwardRef } from "react";
import { type TripPlan, generateShareText } from "@/lib/tripPlanner";
import { categoryLabels, getDestinationById } from "@/data/tnDestinations";
import { Share2, Printer, Map, Train, Bus, Car, Star, Utensils, Building2, Navigation, AlertCircle, CheckCircle2, ExternalLink, Sparkles, TrendingDown, Info, Coins, Check } from "lucide-react";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { generateTrainSearchUrl, roundFriendly } from "@/lib/utils";
interface TripResultsProps {
  plan: TripPlan;
}

const getConfidenceStars = (category: string): string => {
  switch (category) {
    case "city":
      return "★★★★★";
    case "beach":
    case "temple":
    case "heritage":
      return "★★★★☆";
    case "hill":
    case "wildlife":
    default:
      return "★★★☆☆";
  }
};

interface BudgetInsight {
  text: string;
  icon: string;
  badge?: string;
  badgeStyle?: string;
}

const getDynamicBudgetInsights = (plan: TripPlan): BudgetInsight[] => {
  const insights: BudgetInsight[] = [];
  const nights = Math.max(plan.input.days - 1, 0);
  const destCategory = plan.destination.category;
  
  // 1. Affordability/Group Insight
  const avgCost = Math.round((plan.budget.estimatedMin + plan.budget.estimatedMax) / 2);
  const formattedAvg = roundFriendly(avgCost).toLocaleString("en-IN");
  insights.push({
    text: `You can comfortably complete this trip within a realistic budget of ₹${formattedAvg}.`,
    icon: "✨",
    badge: "Recommended",
    badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  });

  // 2. Stay Cost share vs other costs
  if (nights > 0 && plan.budget.hotelMin > 0) {
    const totalMin = plan.budget.estimatedMin;
    const hotelShare = Math.round((plan.budget.hotelMin / totalMin) * 100);
    if (hotelShare > 40) {
      insights.push({
        text: `Hotel costs make up the majority (${hotelShare}%) of this trip's budget. Lowering your stay tier is the fastest way to save.`,
        icon: "🏨",
        badge: "Cost Driver",
        badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      });
    } else {
      insights.push({
        text: `Accommodation is highly cost-effective here, representing just ${hotelShare}% of the total estimated trip cost.`,
        icon: "🏨"
      });
    }
  }

  // 3. Category-specific traveler insight
  switch (destCategory) {
    case "hill":
      insights.push({
        text: "Hill destinations have higher transport costs due to winding ghat roads. Hiring local shared cabs or taking local sightseeing buses can cut costs.",
        icon: "⛰️"
      });
      break;
    case "beach":
      insights.push({
        text: "Beach stays have high seasonal price variations. Booking on weekdays can secure up to 25% lower stay rates.",
        icon: "🏖️"
      });
      break;
    case "temple":
      insights.push({
        text: "Temple towns have highly affordable vegetarian dining and community food options. Perfect for budget-focused travelers.",
        icon: "🛕"
      });
      break;
    case "city":
      insights.push({
        text: "City transit is highly connected by public buses/trains. Use them instead of direct autos to avoid heavy surge pricing.",
        icon: "🌆"
      });
      break;
    case "heritage":
      insights.push({
        text: "Heritage spots are spread out. Hiring an auto for a full day is more cost-effective than booking individual rides for each site.",
        icon: "🏛️"
      });
      break;
    case "wildlife":
      insights.push({
        text: "Wildlife safaris and forest entries have fixed government ticketing charges. Keep cash handy as digital networks can be weak.",
        icon: "🐾"
      });
      break;
    default:
      break;
  }

  // 4. Timing / general savings advice
  insights.push({
    text: "Travelling during weekdays reduces accommodation costs and helps avoid peak weekend crowds.",
    icon: "📅"
  });

  return insights;
};

interface PotentialSaving {
  title: string;
  amount: number;
  explanation: string;
  icon: string;
}

const getPotentialSavings = (plan: TripPlan): PotentialSaving[] => {
  const savings: PotentialSaving[] = [];
  const nights = Math.max(plan.input.days - 1, 0);
  const rooms = plan.budget.rooms || 1;
  const travellers = plan.input.travellers;
  const style = plan.input.style;

  if (nights > 0) {
    if (style === "standard") {
      const diff = Math.max(800 * rooms * nights, roundFriendly(plan.budget.hotelMin * 0.4));
      savings.push({
        title: "Choose Budget Stays",
        amount: diff,
        explanation: "Choosing cozy budget homestays or standard guesthouses instead of comfort hotels.",
        icon: "🏨"
      });
    } else if (style === "comfort") {
      const diff = Math.max(1500 * rooms * nights, roundFriendly(plan.budget.hotelMin * 0.5));
      savings.push({
        title: "Choose Standard Hotel Tier",
        amount: diff,
        explanation: "Choosing cozy 3-star standard comfort hotels instead of luxury premium resorts.",
        icon: "🏨"
      });
    }
  }

  const transportSavings = roundFriendly(Math.max(400 * travellers, plan.budget.transportMax * 0.4));
  if (transportSavings >= 300) {
    savings.push({
      title: "Use Public Transport & Trains",
      amount: transportSavings,
      explanation: "Opting for government buses, shared shuttle transit, or pre-booked sleeper trains instead of private cabs.",
      icon: "🚌"
    });
  }

  if (travellers > 1) {
    const groupSavings = roundFriendly(Math.max(300 * travellers * plan.input.days, plan.budget.estimatedMin * 0.15));
    savings.push({
      title: "Group Sharing Advantages",
      amount: groupSavings,
      explanation: "Sharing rooms and local auto/cab fares among your group members instead of individual occupancy.",
      icon: "👥"
    });
  }

  if (nights > 0) {
    const weekdaySavings = roundFriendly(Math.max(500 * rooms * nights, 1000));
    savings.push({
      title: "Travel on Weekdays",
      amount: weekdaySavings,
      explanation: "Booking your stay on Monday–Thursday nights when local hotels offer steep off-peak discounts.",
      icon: "📅"
    });
  }

  return savings.slice(0, 3);
};

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
    { label: "Transport", min: plan.budget.transportMin, max: plan.budget.transportMax, target: plan.budget.transportTarget, icon: <Navigation className="w-4 h-4" /> },
    { label: "Accommodation", min: plan.budget.hotelMin, max: plan.budget.hotelMax, target: plan.budget.hotelTarget, icon: <Building2 className="w-4 h-4" /> },
    { label: "Food", min: plan.budget.foodMin, max: plan.budget.foodMax, target: plan.budget.foodTarget, icon: <Utensils className="w-4 h-4" /> },
    { label: "Local Travel", min: plan.budget.localMin, max: plan.budget.localMax, target: plan.budget.localTarget, icon: <Map className="w-4 h-4" /> },
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

        {/* Budget Breakdown Redesign */}
        <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 mb-6 border border-border/60">
          
          {/* Hero Recommended Trip Budget */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03] border border-border/40 p-6 md:p-8 mb-8">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  {plan.input.style === "budget" && "Budget Explorer Selected"}
                  {plan.input.style === "standard" && "Comfort Traveler Selected"}
                  {plan.input.style === "comfort" && "Premium Experience Selected"}
                </span>
                
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Approximate Trip Cost
                </h3>
                
                <div className="text-4xl md:text-5xl font-display font-extrabold text-foreground tracking-tight flex items-baseline gap-1">
                  ₹{plan.budget.estimatedMin.toLocaleString("en-IN")}
                  <span className="text-2xl font-normal text-muted-foreground mx-1.5">–</span>
                  ₹{plan.budget.estimatedMax.toLocaleString("en-IN")}
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Total realistic estimate for {plan.input.travellers} {plan.input.travellers === 1 ? 'traveller' : 'travellers'} · {plan.input.days} Days
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-medium">Data Confidence:</span>
                  <span className="text-amber-500 font-bold text-sm tracking-wide">
                    {getConfidenceStars(plan.destination.category)}
                  </span>
                </div>
                
                {(() => {
                  const userBudget = plan.budget.total;
                  const minimumSavings = roundFriendly(userBudget - plan.budget.estimatedMax);
                  const maximumSavings = roundFriendly(userBudget - plan.budget.estimatedMin);
                  const isSafe = minimumSavings >= 0;

                  if (isSafe) {
                    return (
                      <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        <span>Fits your ₹{userBudget.toLocaleString("en-IN")} budget</span>
                      </div>
                    );
                  } else {
                    const minExceed = roundFriendly(Math.max(0, plan.budget.estimatedMin - userBudget));
                    const maxExceed = roundFriendly(plan.budget.estimatedMax - userBudget);
                    return (
                      <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>May exceed budget by ₹{minExceed.toLocaleString("en-IN")} – ₹{maxExceed.toLocaleString("en-IN")}</span>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Recommended Budget Options (Side-by-Side Cards) */}
          <div className="mb-8">
            <h4 className="font-display text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              ✨ Recommended Budget Options
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              Compare alternative travel tiers tailored for different trip experiences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: Budget Explorer */}
              <div className={`flex flex-col h-full rounded-2xl p-5 border transition-all duration-300 relative ${
                plan.input.style === "budget" 
                  ? "border-amber-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] shadow-md scale-[1.02] md:scale-[1.03] z-10" 
                  : "border-border/80 bg-card hover:border-border-hover"
              }`}>
                {plan.input.style === "budget" && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                    Selected Style
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">Budget Explorer</span>
                  <span className="text-base">🎒</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary mb-3">
                  ₹{plan.budget.optionBudgetMin.toLocaleString("en-IN")} – ₹{plan.budget.optionBudgetMax.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mb-5 flex-grow">
                  Perfect for solo backpackers & budget travelers seeking local culture and highly affordable options.
                </p>
                <ul className="space-y-2 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🚌 Government Bus / Local Transit
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🏨 Clean Hostels or Basic Stays
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🍛 Local Messes & authentic street food
                  </li>
                </ul>
              </div>

              {/* Option 2: Comfort Traveler */}
              <div className={`flex flex-col h-full rounded-2xl p-5 border transition-all duration-300 relative ${
                plan.input.style === "standard" 
                  ? "border-amber-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] shadow-md scale-[1.02] md:scale-[1.03] z-10" 
                  : "border-border/80 bg-card hover:border-border-hover"
              }`}>
                {plan.input.style === "standard" && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                    Selected Style
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">Comfort Traveler</span>
                  <span className="text-base">🚆</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary mb-3">
                  ₹{plan.budget.optionComfortMin.toLocaleString("en-IN")} – ₹{plan.budget.optionComfortMax.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mb-5 flex-grow">
                  Balanced trip focusing on highly-rated standard hotel stays and comfortable transport options.
                </p>
                <ul className="space-y-2 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🚆 Trains & Comfortable AC buses
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🏨 standard 3-star rated stays / homestays
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🍽️ Popular family diners & delicacies
                  </li>
                </ul>
              </div>

              {/* Option 3: Premium Experience */}
              <div className={`flex flex-col h-full rounded-2xl p-5 border transition-all duration-300 relative ${
                plan.input.style === "comfort" 
                  ? "border-amber-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.04] shadow-md scale-[1.02] md:scale-[1.03] z-10" 
                  : "border-border/80 bg-card hover:border-border-hover"
              }`}>
                {plan.input.style === "comfort" && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                    Selected Style
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-bold text-foreground">Premium Experience</span>
                  <span className="text-base">✨</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-primary mb-3">
                  ₹{plan.budget.optionPremiumMin.toLocaleString("en-IN")} – ₹{plan.budget.optionPremiumMax.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground mb-5 flex-grow">
                  Top-tier convenience with premium hotels or boutique resorts and completely private transfers.
                </p>
                <ul className="space-y-2 border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🚗 Private Cabs / direct taxi transfers
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🏨 Premium hotels / boutique resorts
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-500">✔</span> 🍱 Signature restaurants & fine dining
                  </li>
                </ul>
              </div>
              
            </div>
          </div>

          {/* Money You Could Save (Actionable Potential Savings Cards) */}
          {(() => {
            const savingsOptions = getPotentialSavings(plan);
            if (savingsOptions.length === 0) return null;
            return (
              <div className="mb-8">
                <h4 className="font-display text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  Money You Could Save
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Smart choices to reduce your trip expenses without sacrificing travel comfort.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savingsOptions.map((saving, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.03]">
                      <span className="text-lg shrink-0 mt-0.5">{saving.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2 w-full">
                          <h5 className="font-semibold text-foreground text-xs">{saving.title}</h5>
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            Save ~₹{saving.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {saving.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Smart Budget Insights */}
          <div className="mb-6">
            <h4 className="font-display text-base font-bold text-foreground mb-1 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Smart Budget Insights
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Local market guidance and customized planning advice.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getDynamicBudgetInsights(plan).map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                  <span className="text-base shrink-0">{insight.icon}</span>
                  <div className="flex-grow">
                    {insight.badge && (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mr-2 ${insight.badgeStyle || "bg-primary/10 text-primary"}`}>
                        {insight.badge}
                      </span>
                    )}
                    <span>{insight.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Spreadsheet Detail Component */}
          <details className="group border border-border/60 rounded-2xl overflow-hidden mt-6 bg-muted/10">
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors select-none font-medium text-xs text-muted-foreground">
              <span className="flex items-center gap-2">📊 View Detailed Cost Breakdown (Spreadsheet View)</span>
              <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
            </summary>
            
            <div className="p-5 border-t border-border/40 bg-card space-y-6">
              
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-[10px] text-muted-foreground mb-1">Hotel / Night</p>
                  <p className="text-base font-display font-bold text-foreground">
                    ₹{plan.budget.hotelPerNightMin.toLocaleString("en-IN")} – ₹{plan.budget.hotelPerNightMax.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-[10px] text-muted-foreground mb-1">Rooms needed</p>
                  <p className="text-base font-display font-bold text-foreground">{plan.budget.rooms || 0}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-[10px] text-muted-foreground mb-1">Trip style</p>
                  <p className="text-base font-display font-bold text-foreground capitalize">{plan.input.style}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4">
                  <p className="text-[10px] text-muted-foreground mb-1">Group Budget Total</p>
                  <p className="text-base font-display font-bold text-foreground">₹{plan.budget.total.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {budgetItems.map(item => (
                  <div key={item.label} className="text-center p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center justify-center mb-1 text-muted-foreground">{item.icon}</div>
                    <p className="text-sm font-bold text-foreground leading-tight">
                      ₹{item.min.toLocaleString("en-IN")} – ₹{item.max.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              
              {/* Simple bar chart */}
              <div>
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div className="gradient-saffron" style={{ width: `${(plan.budget.transport / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Transport" />
                  <div className="gradient-teal" style={{ width: `${(plan.budget.hotel / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Hotel" />
                  <div className="bg-muted-foreground/30" style={{ width: `${(plan.budget.food / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Food" />
                  <div className="bg-muted-foreground/15" style={{ width: `${(plan.budget.local / Math.max(plan.budget.estimatedTotal, 1)) * 100}%` }} title="Local" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-medium">
                  <span>Transport</span>
                  <span>Hotels</span>
                  <span>Food</span>
                  <span>Local</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground border-t border-border/50 pt-3 text-center italic leading-relaxed">
                Component calculations represent standardized budget allocations dynamically calculated based on distance, travellers, and duration constraints.
              </p>
            </div>
          </details>

          <p className="mt-5 text-[11px] text-muted-foreground border-t border-border/50 pt-3 text-center italic leading-relaxed">
            Travel costs are approximate and may vary based on season, booking availability, transport availability, accommodation choice and personal spending.
          </p>
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
