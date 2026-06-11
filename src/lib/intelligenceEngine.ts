import { type TNDestination, type Hotel } from "../data/tnDestinations";
import { getAttractionDetail } from "../data/activityDatabase";
import { FOOD_PROFILES, getFoodCostIndex } from "../data/foodProfiles";
import { HOTEL_RANGES } from "./hotelPrices";
import { roundFriendly } from "./utils";

export type TravelStyle = "budget" | "standard" | "comfort";
export type TravellerType = "solo" | "couple" | "family" | "friends" | "seniors";

export interface TripInput {
  source: string;
  destination: string;
  days: number;
  travellers: number;
  style: TravelStyle;
  budget: number;
  travellerType: TravellerType;
}

export interface RouteIntelligence {
  roadDistanceKm: number;
  estimatedDurationMinutes: number;
  routeSource: "OSRM";
  routeStatus: "verified" | "fallback";
}

export interface RouteLeg {
  from: string;
  to: string;
  fromStation?: string;
  toStation?: string;
  mode: "bus" | "train" | "auto";
  distanceKm: number;
  costPerPerson: number;
  duration: string;
  frequency?: string;
  note?: string;
  routeIntel?: RouteIntelligence;
}

export interface HotelPricingEvidence {
  source: "estimated";
  reason: string;
  nearbyHotelsFound: number;
}

export interface HotelMarketIntelligence {
  observedHotelsList: { name: string; priceCategory: string; rating: number; distanceKm: number }[];
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  minRecommendedPrice: number;
  maxRecommendedPrice: number;
  pricingEvidence: HotelPricingEvidence;
}

export interface FoodMealBreakdown {
  breakfast: { min: number; max: number };
  lunch: { min: number; max: number };
  dinner: { min: number; max: number };
  snacks: { min: number; max: number };
  minPerDay: number;
  maxPerDay: number;
}

export interface AttractionBreakdownItem {
  name: string;
  entryFeeAdult: number;
  parkingFee: number;
  cameraFee: number;
  lastVerified: string;
  verificationSource: string;
  databaseVersion: string;
}

export interface AttractionBreakdown {
  attractionsList: AttractionBreakdownItem[];
  mappedAttractionsCount: number;
}

export interface EvidenceChecklist {
  roadRouteVerified: boolean;
  hotelInventoryAvailable: boolean;
  attractionDatabaseAvailable: boolean;
  foodProfileAvailable: boolean;
  destinationMetadataAvailable: boolean;
}

export type BudgetReliability = "Low" | "Moderate" | "High" | "Very High";

export interface BudgetAssumptions {
  travellerCount: number;
  tripDurationDays: number;
  hotelStyle: string;
  foodStyle: string;
  transportStyle: string;
  activityCoverage: string;
}

export interface CostComponentDetail {
  name: string;
  min: number;
  max: number;
  formula: string;
  reason: string;
  source: string;
  foodBreakdown?: FoodMealBreakdown;
  attractionBreakdown?: AttractionBreakdown;
  hotelMarketIntel?: HotelMarketIntelligence;
}

export interface TravelCostIntelligence {
  intelligenceVersion: "v4.3";
  minRequired: number;
  comfortBudget: number;
  expectedSpend: number;
  emergencyBuffer: number;
  recommendedCarry: number;
  evidenceChecklist: EvidenceChecklist;
  assumptions: BudgetAssumptions;
  components: {
    transport: CostComponentDetail;
    hotel: CostComponentDetail;
    food: CostComponentDetail;
    mobility: CostComponentDetail;
    activities: CostComponentDetail;
    buffer: CostComponentDetail;
  };
}

function getRoomCapacity(style: TravelStyle): number {
  return style === "budget" ? 3 : 2;
}

export function getBudgetReliability(checklist: EvidenceChecklist): { reliability: BudgetReliability; reason: string } {
  const keys: (keyof EvidenceChecklist)[] = [
    "roadRouteVerified",
    "hotelInventoryAvailable",
    "attractionDatabaseAvailable",
    "foodProfileAvailable",
    "destinationMetadataAvailable"
  ];
  
  const labels: Record<keyof EvidenceChecklist, string> = {
    roadRouteVerified: "Route Verified",
    hotelInventoryAvailable: "Hotel Inventory Available",
    attractionDatabaseAvailable: "Attraction Database Available",
    foodProfileAvailable: "Food Profile Available",
    destinationMetadataAvailable: "Destination Cost Profile Available"
  };

  const missing: string[] = [];
  const verified: string[] = [];
  for (const key of keys) {
    if (checklist[key]) {
      verified.push(labels[key]);
    } else {
      missing.push(labels[key]);
    }
  }

  const verifiedCount = verified.length;
  let reliability: BudgetReliability = "Low";
  if (verifiedCount === 5) {
    reliability = "Very High";
  } else if (verifiedCount === 4) {
    reliability = "High";
  } else if (verifiedCount === 3) {
    reliability = "Moderate";
  } else {
    reliability = "Low";
  }

  let reason = "";
  if (reliability === "Very High") {
    reason = "All 5/5 intelligence sources verified.";
  } else if (missing.length > 0) {
    reason = `${reliability} reliability: missing ${missing.join(", ")}.`;
  } else {
    reason = `${reliability} reliability.`;
  }

  return { reliability, reason };
}

export function calculateTravelCostIntelligence(
  input: TripInput,
  dest: TNDestination,
  route: RouteLeg[],
  hotels: Hotel[]
): TravelCostIntelligence {
  const days = input.days;
  const travellers = input.travellers;
  const style = input.style;
  const nights = Math.max(days - 1, 0);
  const rooms = nights > 0 ? Math.ceil(travellers / getRoomCapacity(style)) : 0;

  const costIndex = dest.costIndex || 3;
  const mobilityProfile = dest.mobilityProfile || "medium";

  // --- 1. Transport Component ---
  const distanceKm = route.reduce((sum, leg) => sum + leg.distanceKm, 0);
  const trainMin = Math.round(distanceKm * 0.75 * 2 * travellers / 50) * 50;
  const trainMax = Math.round(distanceKm * 1.30 * 2 * travellers / 50) * 50;
  const govtBusMin = Math.round(distanceKm * 1.20 * 2 * travellers / 50) * 50;
  const govtBusMax = Math.round(distanceKm * 1.60 * 2 * travellers / 50) * 50;
  const privBusMin = Math.round(distanceKm * 1.70 * 2 * travellers / 50) * 50;
  const privBusMax = Math.round(distanceKm * 2.60 * 2 * travellers / 50) * 50;

  const primaryLeg = route[0];
  const primaryMode = primaryLeg ? primaryLeg.mode : "bus";

  let transportMin = govtBusMin;
  let transportMax = govtBusMax;
  let transportFormula = `Govt Bus Rate (2 × ${distanceKm} km × ₹1.2–₹1.6/km) × ${travellers} Pax`;

  if (primaryMode === "train") {
    transportMin = trainMin;
    transportMax = trainMax;
    transportFormula = `Train Sleeper Rate (2 × ${distanceKm} km × ₹0.75–₹1.3/km) × ${travellers} Pax`;
  } else if (style === "comfort") {
    transportMin = privBusMin;
    transportMax = privBusMax;
    transportFormula = `Private Bus Rate (2 × ${distanceKm} km × ₹1.7–₹2.6/km) × ${travellers} Pax`;
  }

  if (distanceKm === 0) {
    transportMin = 0;
    transportMax = 0;
    transportFormula = "No intercity travel required";
  }

  const transportDetail: CostComponentDetail = {
    name: "Transport",
    min: transportMin,
    max: transportMax,
    formula: transportFormula,
    reason: distanceKm > 0 
      ? `Based on intercity road route of ${distanceKm} km from ${input.source.toUpperCase()} to ${input.destination.toUpperCase()}.`
      : "Source and destination are the same.",
    source: "OpenStreetMap Routing & Railway Station Mapping"
  };

  // --- 2. Hotel Component ---
  let hotelMin = 0;
  let hotelMax = 0;
  let hotelFormula = "Day trip (0 nights stay)";
  let hotelReason = "This is a day trip. No accommodation required.";
  let hotelSource = "N/A";
  let hotelMarketIntel: HotelMarketIntelligence | undefined;

  const validHotels = (hotels || []).filter(h => h.name && !h.name.startsWith("Search hotels"));
  const observedHotelsCount = validHotels.length;
  const hasInventory = observedHotelsCount > 0;

  let baseMinRate = 1500;
  let baseMaxRate = 3000;
  if (style === "budget") {
    baseMinRate = 800;
    baseMaxRate = 1500;
  } else if (style === "comfort") {
    baseMinRate = 3000;
    baseMaxRate = 5500;
  }

  if (nights > 0) {
    const hotelFactor = 1 + (costIndex - 3) * 0.15;
    const rateMin = Math.round(baseMinRate * hotelFactor / 100) * 100;
    const rateMax = Math.round(baseMaxRate * hotelFactor / 100) * 100;

    const minRecommendedPrice = rateMin + (style === "budget" ? 300 : style === "comfort" ? 500 : 400);
    const maxRecommendedPrice = rateMax + (style === "budget" ? 400 : style === "comfort" ? 1000 : 700);

    hotelMin = rateMin * rooms * nights;
    hotelMax = rateMax * rooms * nights;
    hotelFormula = `${nights} Nights × ${rooms} Rooms × Room Rate (₹${rateMin}–₹${rateMax}/night)`;
    hotelReason = `Derived using standard style parameters for ${dest.name}.`;
    hotelSource = "Sikkanam Local Hotel Inventory Database";

    const observedHotelsList = validHotels.map(h => ({
      name: h.name,
      priceCategory: h.priceCategory || "standard",
      rating: h.rating || 4.0,
      distanceKm: h.distanceKm || 1.0
    }));

    hotelMarketIntel = {
      observedHotelsList,
      minEstimatedPrice: rateMin,
      maxEstimatedPrice: rateMax,
      minRecommendedPrice,
      maxRecommendedPrice,
      pricingEvidence: {
        source: "estimated",
        reason: hasInventory 
          ? `Based on standard market ranges adjusted for ${dest.name}`
          : "Derived using regional category averages",
        nearbyHotelsFound: observedHotelsCount
      }
    };
  }

  const hotelDetail: CostComponentDetail = {
    name: "Hotels",
    min: hotelMin,
    max: hotelMax,
    formula: hotelFormula,
    reason: hotelReason,
    source: hotelSource,
    hotelMarketIntel
  };

  // --- 3. Food Component ---
  const foodCostIndex = getFoodCostIndex(costIndex);
  const foodProfile = FOOD_PROFILES[foodCostIndex][style];

  const minFoodPerDay = foodProfile.breakfast.min + foodProfile.lunch.min + foodProfile.dinner.min + foodProfile.snacks.min;
  const maxFoodPerDay = foodProfile.breakfast.max + foodProfile.lunch.max + foodProfile.dinner.max + foodProfile.snacks.max;

  const foodMin = minFoodPerDay * days * travellers;
  const foodMax = maxFoodPerDay * days * travellers;

  const foodBreakdown: FoodMealBreakdown = {
    breakfast: foodProfile.breakfast,
    lunch: foodProfile.lunch,
    dinner: foodProfile.dinner,
    snacks: foodProfile.snacks,
    minPerDay: minFoodPerDay,
    maxPerDay: maxFoodPerDay
  };

  const foodDetail: CostComponentDetail = {
    name: "Food",
    min: foodMin,
    max: foodMax,
    formula: `Days (${days}) × Travellers (${travellers}) × Meal Sum (₹${minFoodPerDay}–₹${maxFoodPerDay}/day)`,
    reason: `Calculated from ${foodCostIndex} Food Cost Index database defaults for ${dest.category} category.`,
    source: "Sikkanam Food Cost Profiles Database",
    foodBreakdown
  };

  // --- 4. Local Mobility Component ---
  let dailyMobilityMin = 250;
  let dailyMobilityMax = 600;
  if (mobilityProfile === "low") {
    dailyMobilityMin = style === "budget" ? 100 : style === "comfort" ? 200 : 150;
    dailyMobilityMax = style === "budget" ? 200 : style === "comfort" ? 300 : 250;
  } else if (mobilityProfile === "high") {
    dailyMobilityMin = style === "budget" ? 300 : style === "comfort" ? 600 : 400;
    dailyMobilityMax = style === "budget" ? 500 : style === "comfort" ? 1200 : 800;
  } else {
    dailyMobilityMin = style === "budget" ? 200 : style === "comfort" ? 400 : 250;
    dailyMobilityMax = style === "budget" ? 350 : style === "comfort" ? 700 : 500;
  }

  const mobilityMin = dailyMobilityMin * days;
  const mobilityMax = dailyMobilityMax * days;

  const mobilityDetail: CostComponentDetail = {
    name: "Local Mobility",
    min: mobilityMin,
    max: mobilityMax,
    formula: `Days (${days}) × Daily Mobility Profile (₹${dailyMobilityMin}–₹${dailyMobilityMax}/day)`,
    reason: `Based on attraction spread (mobility profile: ${mobilityProfile}) and travel style.`,
    source: "Sikkanam Local Mobility Profile Mapping"
  };

  // --- 5. Activity Component ---
  const planAttractions = dest.attractions.slice(0, Math.min(days * 4, dest.attractions.length));
  const attractionsList = planAttractions.map(name => {
    const detail = getAttractionDetail(name);
    return {
      name: detail.name,
      entryFeeAdult: detail.entryFeeAdult,
      parkingFee: detail.parkingFee,
      cameraFee: detail.cameraFee,
      lastVerified: detail.lastVerified,
      verificationSource: detail.verificationSource,
      databaseVersion: detail.databaseVersion
    };
  });

  const entryFeesSum = attractionsList.reduce((sum, item) => sum + item.entryFeeAdult, 0);
  const parkingFeesSum = attractionsList.reduce((sum, item) => sum + item.parkingFee, 0);
  const cameraFeesSum = attractionsList.reduce((sum, item) => sum + item.cameraFee, 0);

  const activityMin = entryFeesSum * travellers;
  const activityMax = entryFeesSum * travellers + parkingFeesSum + cameraFeesSum + (30 * days * travellers);

  const attractionBreakdown: AttractionBreakdown = {
    attractionsList,
    mappedAttractionsCount: attractionsList.length
  };

  const activityDetail: CostComponentDetail = {
    name: "Activities",
    min: activityMin,
    max: activityMax,
    formula: `(Attraction entry fees: ₹${entryFeesSum} × ${travellers} pax) + parking/camera fees & buffer`,
    reason: `Derived dynamically from ${attractionsList.length} attractions in database.`,
    source: "Sikkanam Attraction Fee Database",
    attractionBreakdown
  };

  // --- 6. Emergency Buffer Component ---
  const bufferMin = 250 * days * travellers;
  const bufferMax = 500 * days * travellers;

  const bufferDetail: CostComponentDetail = {
    name: "Emergency Buffer",
    min: bufferMin,
    max: bufferMax,
    formula: `Daily Buffer (₹250–₹500) × Days (${days}) × Travellers (${travellers})`,
    reason: "To cover unexpected local transport, extra meals, and small purchases.",
    source: "Sikkanam Risk Management Guidelines"
  };

  // --- Totals ---
  const minRequired = transportMin + hotelMin + foodMin + mobilityMin + activityMin + bufferMin;
  const maxSpend = transportMax + hotelMax + foodMax + mobilityMax + activityMax;
  
  const roundedExpectedSpend = Math.round(maxSpend / 500) * 500;
  const roundedBuffer = Math.round(bufferMax / 500) * 500;
  const recommendedCarry = roundedExpectedSpend + roundedBuffer;

  const transportComfort = Math.round((transportMin + transportMax) / 2 / 10) * 10;
  const hotelComfort = Math.round((hotelMin + hotelMax) / 2 / 50) * 50;
  const foodComfort = Math.round((foodMin + foodMax) / 2 / 10) * 10;
  const mobilityComfort = Math.round((mobilityMin + mobilityMax) / 2 / 10) * 10;
  const activityComfort = Math.round((activityMin + activityMax) / 2 / 10) * 10;
  const bufferComfort = Math.round((bufferMin + bufferMax) / 2 / 10) * 10;
  const comfortBudget = transportComfort + hotelComfort + foodComfort + mobilityComfort + activityComfort + bufferComfort;

  const evidenceChecklist: EvidenceChecklist = {
    roadRouteVerified: route.length > 0 && route.some(leg => leg.routeIntel?.routeStatus === "verified"),
    hotelInventoryAvailable: hasInventory,
    attractionDatabaseAvailable: attractionsList.length > 0,
    foodProfileAvailable: true,
    destinationMetadataAvailable: typeof dest.costIndex === "number" && dest.costIndex > 0
  };

  const assumptions: BudgetAssumptions = {
    travellerCount: travellers,
    tripDurationDays: days,
    hotelStyle: style === "budget" ? "Budget Lodges" : style === "comfort" ? "Premium Hotels" : "Standard Rooms",
    foodStyle: style === "budget" ? "Mess / Local Eateries" : style === "comfort" ? "Fine Dining / Restaurants" : "Standard Restaurants",
    transportStyle: primaryMode === "train" ? "Train (Sleeper) + Local Mobility" : (style === "comfort" ? "Private Bus / Cab + Local Mobility" : "Govt Bus + Local Mobility"),
    activityCoverage: "Top attractions listed in standard itinerary"
  };

  return {
    intelligenceVersion: "v4.3",
    minRequired,
    comfortBudget,
    expectedSpend: roundedExpectedSpend,
    emergencyBuffer: roundedBuffer,
    recommendedCarry,
    evidenceChecklist,
    assumptions,
    components: {
      transport: transportDetail,
      hotel: hotelDetail,
      food: foodDetail,
      mobility: mobilityDetail,
      activities: activityDetail,
      buffer: bufferDetail
    }
  };
}
