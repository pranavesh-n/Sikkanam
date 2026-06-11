import { getNearbyHotels } from "@/services/hotelservice";
import {
  getDistance,
  getDestinationById,
  categoryLabels,
  type TNDestination,
  type Hotel
} from "@/data/tnDestinations";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { CATEGORY_PRICING } from "@/data/categoryPricing";
import { roundFriendly } from "@/lib/utils";
import { getAttractionDetail, type AttractionDetail } from "@/data/activityDatabase";
import { FOOD_PROFILES, getFoodCostIndex, type MealProfile } from "@/data/foodProfiles";
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
export interface BudgetBreakdown {
  transport: number;
  hotel: number;
  food: number;
  local: number;
  transportMin: number;
  transportMax: number;
  hotelMin: number;
  hotelMax: number;
  foodMin: number;
  foodMax: number;
  localMin: number;
  localMax: number;
  transportTarget: number;
  hotelTarget: number;
  foodTarget: number;
  localTarget: number;
  total: number;
  perPerson: number;
  estimatedTotal: number;
  estimatedMin: number;
  estimatedMax: number;
  remaining: number;
  status: "within" | "over";
  hotelPerNight: number;
  hotelPerNightMin: number;
  hotelPerNightMax: number;
  rooms: number;
  optionBudgetMin: number;
  optionBudgetMax: number;
  optionComfortMin: number;
  optionComfortMax: number;
  optionPremiumMin: number;
  optionPremiumMax: number;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
  meals: string;
  estimatedCost: number;
}

export interface RecommendationMatch {
  destId: string;
  name: string;
  emoji: string;
  matchScore: number;
  budgetMatch: number;
  accessibility: number;
  seasonMatch: number;
  travellerMatch: number;
  durationMatch: number;
  whyVisit: string;
  category: string;
}

import {
  calculateTravelCostIntelligence,
  getBudgetReliability,
  type RouteIntelligence,
  type HotelPricingEvidence,
  type HotelMarketIntelligence,
  type FoodMealBreakdown,
  type AttractionBreakdownItem,
  type AttractionBreakdown,
  type EvidenceChecklist,
  type BudgetReliability,
  type BudgetAssumptions,
  type CostComponentDetail,
  type TravelCostIntelligence
} from "./intelligenceEngine";

export {
  calculateTravelCostIntelligence,
  getBudgetReliability,
  type RouteIntelligence,
  type HotelPricingEvidence,
  type HotelMarketIntelligence,
  type FoodMealBreakdown,
  type AttractionBreakdownItem,
  type AttractionBreakdown,
  type EvidenceChecklist,
  type BudgetReliability,
  type BudgetAssumptions,
  type CostComponentDetail,
  type TravelCostIntelligence
};

export interface SmartAlternative {
  destId: string;
  name: string;
  matchScore: number;
  reasonBetter: string;
}

export interface TripPlan {
  input: TripInput;
  route: RouteLeg[];
  budget: BudgetBreakdown;
  hotels: Hotel[];
  attractions: string[];
  itinerary: DayPlan[];
  destination?: TNDestination;
  tips: string[];
  feasibility?: {
    score: number;
    grade: string;
    reasons: string[];
  };
  recommendations?: RecommendationMatch[];
  alternatives?: SmartAlternative[];
  nearbyExperiences?: {
    name: string;
    distanceKm: number;
    type: string;
  }[];
  suggestedCircuits?: {
    name: string;
    route: string[];
    description: string;
  }[];
  aiItinerary?: string;
  intelligence?: TravelCostIntelligence;
}

type RouteCandidate = {
  legs: RouteLeg[];
  totalCost: number;
  transferCount: number;
  preferredForComfort?: boolean;
};

type GatewayConfig = {
  hub: string;
  lastMileKm: number;
  lastMileMode: "bus" | "auto";
  lastMileDuration: string;
  frequency: string;
  note: string;
};
function getHotelMinPrice(hotel: Hotel) {
  switch (hotel.priceCategory) {
    case "budget":
      return 800;
    case "standard":
      return 1500;
    case "comfort":
      return 3000;
    case "premium":
      return 5500;
    default:
      return 1500;
  }
}

export const USE_BACKEND_API = true;

function getPredefinedCircuit(destId: string): { name: string; route: string[]; description: string } | null {
  const templeCircuit = ["chidambaram", "kumbakonam", "thanjavur"];
  const hillCircuit = ["ooty", "coonoor", "coimbatore"];
  const waterfallCircuit = ["courtallam", "tirunelveli"];
  
  if (templeCircuit.includes(destId)) {
    return {
      name: "Chola Temple Circuit 🛕",
      route: ["Chidambaram", "Kumbakonam", "Thanjavur"],
      description: "Explore the architectural wonders of the Chola Dynasty, connecting grand temple towns."
    };
  }
  if (hillCircuit.includes(destId)) {
    return {
      name: "Nilgiris Hill Circuit 🏔️",
      route: ["Ooty", "Coonoor"],
      description: "Soak in the serene tea valleys, mountain railways, and viewpoints of Nilgiris."
    };
  }
  if (waterfallCircuit.includes(destId)) {
    return {
      name: "Southern Waterfall Circuit 💦",
      route: ["Courtallam", "Papanasam", "Tirunelveli"],
      description: "Refresh yourself with medicinal waters, mountain dams, and historic temples."
    };
  }
  return null;
}

function buildDynamicCircuits(dest: TNDestination, allDests: TNDestination[]): { name: string; route: string[]; description: string }[] {
  const circuits: { name: string; route: string[]; description: string }[] = [];
  const predefined = getPredefinedCircuit(dest.id);
  if (predefined) {
    circuits.push(predefined);
  }
  
  const closeMatches = allDests
    .filter(d => d.id !== dest.id && d.category === dest.category)
    .map(d => ({
      d,
      dist: getDistance(dest.lat, dest.lng, d.lat, d.lng)
    }))
    .filter(item => item.dist <= 80)
    .sort((a, b) => a.dist - b.dist);
    
  if (closeMatches.length >= 2) {
    const route = [dest.name, ...closeMatches.slice(0, 2).map(item => item.d.name)];
    let circuitName = "";
    let circuitDesc = "";
    if (dest.category === "temple") {
      circuitName = "Custom Temple Circuit 🛕";
      circuitDesc = `A cluster of close spiritual locations: ${route.join(" → ")}.`;
    } else if (dest.category === "hill") {
      circuitName = "Custom Hill Circuit 🏔️";
      circuitDesc = `Escape to multiple mountain getaways: ${route.join(" → ")}.`;
    } else if (dest.category === "beach") {
      circuitName = "Custom Coastal Circuit 🏖️";
      circuitDesc = `Discover scenic shorelines and beach towns: ${route.join(" → ")}.`;
    } else {
      circuitName = `Custom ${dest.category.charAt(0).toUpperCase() + dest.category.slice(1)} Circuit 🗺️`;
      circuitDesc = `A rich experience routing: ${route.join(" → ")}.`;
    }
    
    if (!predefined || predefined.route[0] !== route[0]) {
      circuits.push({
        name: circuitName,
        route,
        description: circuitDesc
      });
    }
  }
  return circuits;
}

function calculateFeasibilityScore(
  input: TripInput,
  dest: TNDestination,
  estimatedMinTotal: number,
  distanceKm: number
) {
  const reasons: string[] = [];
  
  // 1. Distance Suitability
  const distancePerDay = distanceKm / input.days;
  let distScore = 100;
  if (input.days === 1 && distanceKm > 150) {
    distScore = Math.max(10, 100 - (distanceKm - 150) * 0.8);
    reasons.push("✗ Travel distance too high for a one-day trip");
  } else if (distancePerDay > 250) {
    distScore = Math.max(10, 100 - (distancePerDay - 250) * 0.5);
    reasons.push("✗ Travel distance too high relative to trip duration");
  }
  
  // 2. Budget Suitability
  const userTotalBudget = input.budget * input.travellers;
  let budgetScore = 100;
  if (userTotalBudget < estimatedMinTotal) {
    budgetScore = Math.max(10, Math.round((userTotalBudget / estimatedMinTotal) * 100));
    reasons.push("✗ Budget insufficient");
  }
  
  // 3. Duration Suitability
  const recommendedDays = dest.recommendedDays || 2;
  let durationScore = 100;
  if (input.days < recommendedDays) {
    durationScore = Math.max(20, 100 - (recommendedDays - input.days) * 35);
    reasons.push("✗ Trip duration too short");
  }
  
  // 4. Transport Accessibility
  let transportScore = 100;
  if (!dest.hasRailAccess) {
    transportScore = 80;
    if (dest.category === "hill" || dest.id === "valparai" || dest.id === "kolli-hills") {
      transportScore = 60;
    }
  }
  if (input.travellerType === "seniors" && transportScore < 100) {
    transportScore -= 15;
    reasons.push("✗ Multiple transport transfers required");
  }
  
  // 5. Traveller Type Compatibility
  let travellerScore = 100;
  const difficulty = dest.difficulty || "easy";
  if (input.travellerType === "seniors" && difficulty === "challenging") {
    travellerScore = 40;
    reasons.push("✗ Sightseeing locations require strenuous trekking");
  } else if (input.travellerType === "family" && difficulty === "challenging") {
    travellerScore = 70;
    reasons.push("✗ Rugged terrain less suitable for families");
  }
  
  // 6. Accommodation Availability
  let accomScore = 100;
  const nights = Math.max(input.days - 1, 0);
  if (nights > 0) {
    const minHotelCostPerNight = HOTEL_RANGES[input.style === "budget" ? "budget" : input.style === "comfort" ? "comfort" : "standard"].min;
    const rooms = Math.ceil(input.travellers / (input.style === "budget" ? 3 : 2));
    const targetRoomCost = minHotelCostPerNight * rooms * nights;
    const budgetAllocatedForHotel = userTotalBudget * 0.4;
    if (budgetAllocatedForHotel < targetRoomCost) {
      accomScore = Math.max(30, Math.round((budgetAllocatedForHotel / targetRoomCost) * 100));
      reasons.push("✗ Stay accommodation budget is limited");
    }
  }
  
  const score = Math.round(
    (distScore + budgetScore + durationScore + transportScore + travellerScore + accomScore) / 6
  );
  
  let grade = "Possible";
  if (score >= 85) grade = "Highly Recommended";
  else if (score >= 60) grade = "Good Choice";
  else if (score >= 40) grade = "Possible";
  else grade = "Not Recommended";
  
  return { score, grade, reasons };
}

function scoreDestinationForRecommendation(
  input: Omit<TripInput, "destination">,
  dest: TNDestination,
  srcDest: TNDestination
): RecommendationMatch {
  const distance = getDistance(srcDest.lat, srcDest.lng, dest.lat, dest.lng);
  
  const nights = Math.max(input.days - 1, 0);
  const rooms = Math.ceil(input.travellers / (input.style === "budget" ? 3 : 2));
  
  const pricing = CATEGORY_PRICING[dest.category] || CATEGORY_PRICING.city;
  const hotelRange = input.style === "budget" ? pricing.hotelBudget : input.style === "comfort" ? pricing.hotelPremium : pricing.hotelStandard;
  
  const transitCost = Math.round(distance * (input.style === "comfort" ? 1.5 : 1.0) * 2 * input.travellers);
  const hotelCost = hotelRange[0] * rooms * nights;
  const foodCost = pricing.food[0] * input.travellers * input.days;
  const localCost = pricing.local[0] * input.travellers * input.days;
  const minRequiredCost = transitCost + hotelCost + foodCost + localCost;
  
  const userTotalBudget = input.budget * input.travellers;
  let budgetMatch = 100;
  if (userTotalBudget < minRequiredCost) {
    budgetMatch = Math.max(10, Math.round((userTotalBudget / minRequiredCost) * 100));
  }
  
  let accessibility = 100;
  if (!dest.hasRailAccess) {
    accessibility = 80;
    if (dest.category === "hill" || dest.id === "valparai" || dest.id === "kolli-hills") {
      accessibility = 60;
    }
  }
  if (input.travellerType === "seniors" && accessibility < 100) {
    accessibility -= 15;
  }
  
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const bestMonths = dest.bestMonths || [];
  let seasonMatch = 50;
  if (bestMonths.includes(currentMonth)) {
    seasonMatch = 100;
  } else {
    seasonMatch = 75;
  }
  
  let travellerMatch = 100;
  const difficulty = dest.difficulty || "easy";
  if (input.travellerType === "seniors" && difficulty === "challenging") {
    travellerMatch = 40;
  } else if (input.travellerType === "family" && difficulty === "challenging") {
    travellerMatch = 65;
  } else if (input.travellerType === "couple" && dest.category === "hill") {
    travellerMatch = 100;
  }
  
  const recommendedDays = dest.recommendedDays || 2;
  let durationMatch = 100;
  if (input.days < recommendedDays) {
    durationMatch = Math.max(20, 100 - (recommendedDays - input.days) * 35);
  } else if (input.days > recommendedDays + 2) {
    durationMatch = 85;
  }
  
  const matchScore = Math.round(
    (budgetMatch + accessibility + seasonMatch + travellerMatch + durationMatch) / 5
  );
  
  return {
    destId: dest.id,
    name: dest.name,
    emoji: dest.emoji,
    matchScore,
    budgetMatch,
    accessibility,
    seasonMatch,
    travellerMatch,
    durationMatch,
    whyVisit: dest.whyVisit || dest.description,
    category: dest.category
  };
}

function getSmartAlternatives(
  input: TripInput,
  currentDest: TNDestination,
  currentFeasibility: number,
  allDests: TNDestination[],
  srcDest: TNDestination
): SmartAlternative[] {
  if (currentFeasibility >= 60) return [];
  
  const scored = allDests
    .filter(d => d.id !== currentDest.id && d.id !== input.source)
    .map(d => {
      const match = scoreDestinationForRecommendation(input, d, srcDest);
      return {
        destId: d.id,
        name: d.name,
        matchScore: match.matchScore,
        category: d.category,
        distance: getDistance(srcDest.lat, srcDest.lng, d.lat, d.lng)
      };
    })
    .filter(item => item.matchScore >= 70)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
    
  return scored.map(item => {
    let reasonBetter = "Closer distance and fits better within budget.";
    const currentDist = getDistance(srcDest.lat, srcDest.lng, currentDest.lat, currentDest.lng);
    if (item.distance < currentDist) {
      reasonBetter = `Closer to home (${Math.round(currentDist - item.distance)} km saved) for a more realistic driving duration.`;
    } else if (item.category === currentDest.category) {
      reasonBetter = `Easier travel accessibility and duration match for a ${input.days}-day trip.`;
    } else {
      reasonBetter = `More accessible travel route and better overall budget alignment.`;
    }
    return {
      destId: item.destId,
      name: item.name,
      matchScore: item.matchScore,
      reasonBetter
    };
  });
}

export async function generateTripPlan(input: TripInput): Promise<TripPlan> {
  const dests = (await import("@/data/tnDestinations")).tnDestinations;
  const srcDest = dests.find(d => d.id === input.source);
  
  if (input.destination === "") {
    if (!srcDest) throw new Error("Invalid source");
    const recommendations = dests
      .filter(d => d.id !== input.source)
      .map(d => scoreDestinationForRecommendation(input, d, srcDest))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
      
    const firstRec = dests.find(d => d.id === recommendations[0].destId)!;
      
    return {
      input,
      route: [],
      budget: {
        transport: 0, hotel: 0, food: 0, local: 0,
        transportMin: 0, transportMax: 0, hotelMin: 0, hotelMax: 0,
        foodMin: 0, foodMax: 0, localMin: 0, localMax: 0,
        transportTarget: 0, hotelTarget: 0, foodTarget: 0, localTarget: 0,
        total: input.budget * input.travellers, perPerson: input.budget,
        estimatedTotal: 0, estimatedMin: 0, estimatedMax: 0, remaining: 0,
        status: "within", hotelPerNight: 0, hotelPerNightMin: 0, hotelPerNightMax: 0,
        rooms: 0, optionBudgetMin: 0, optionBudgetMax: 0,
        optionComfortMin: 0, optionComfortMax: 0, optionPremiumMin: 0, optionPremiumMax: 0
      },
      hotels: [],
      attractions: [],
      itinerary: [],
      tips: [],
      destination: firstRec,
      recommendations
    };
  }

  const dest = getDestinationById(input.destination);
  if (!dest) throw new Error("Invalid destination");

  if (USE_BACKEND_API) {
    try {
      const response = await fetch("/api/generatePlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload && payload.plan) {
          return payload.plan;
        }
      }
    } catch (e) {
      console.warn("Backend API failed, calling client-side fallback:", e);
    }
  }

  const totalBudget = input.budget * input.travellers;
  const nights = Math.max(input.days - 1, 0);
  const route = await calculateRoute(input.source, input.destination, input.style);
  const targets = getBudgetTargets(totalBudget);

  const roundTripPerPerson = route.reduce((sum, leg) => sum + leg.costPerPerson, 0) * 2;
  const transportEstimate = roundCurrency(Math.min(roundTripPerPerson * input.travellers, targets.transport));

  const targetHotelBudget = nights > 0 ? targets.hotel : 0;
  const rooms = nights > 0 ? Math.ceil(input.travellers / getRoomCapacity(input.style)) : 0;
  const hotelPerNight = nights > 0 && rooms > 0 ? roundCurrency(targetHotelBudget / nights / rooms) : 0;
  const hotels =
   nights > 0
     ? await getNearbyHotels(
         dest.id,
         dest.lat,
         dest.lng
       )
     : [];

  const hotelEstimate = nights > 0 ? targetHotelBudget : 0;

  const foodPerPersonPerDay = FOOD_COST_PER_DAY[input.style] + (dest.category === "hill" || dest.category === "wildlife" ? 40 : 0);
  const foodEstimate = roundCurrency(Math.min(foodPerPersonPerDay * input.days * input.travellers, targets.food));

  const localPerPersonPerDay = LOCAL_COST_PER_DAY_BY_CATEGORY[dest.category];
  const localEstimate = roundCurrency(Math.min(localPerPersonPerDay * input.days * input.travellers, targets.local));

  const estimatedTotal = transportEstimate + hotelEstimate + foodEstimate + localEstimate;
  
  const pricing = CATEGORY_PRICING[dest.category] || CATEGORY_PRICING.city;

  let hotelRange: [number, number];
  if (input.style === "budget") {
    hotelRange = pricing.hotelBudget;
  } else if (input.style === "comfort") {
    hotelRange = pricing.hotelPremium;
  } else {
    hotelRange = pricing.hotelStandard;
  }

  const transportMin = roundFriendly(Math.max(pricing.transport[0] * input.travellers, Math.round(transportEstimate * 0.85)));
  const transportMax = roundFriendly(Math.max(pricing.transport[1] * input.travellers, Math.round(transportEstimate * 1.2)));

  const hotelPerNightMin = nights > 0 ? roundFriendly(hotelRange[0]) : 0;
  const hotelPerNightMax = nights > 0 ? roundFriendly(hotelRange[1]) : 0;

  const hotelMin = nights > 0 ? roundFriendly(hotelPerNightMin * (rooms || 1) * nights) : 0;
  const hotelMax = nights > 0 ? roundFriendly(hotelPerNightMax * (rooms || 1) * nights) : 0;

  const foodMin = roundFriendly(pricing.food[0] * input.travellers * input.days);
  const foodMax = roundFriendly(pricing.food[1] * input.travellers * input.days);

  const localMin = roundFriendly(pricing.local[0] * input.travellers * input.days);
  const localMax = roundFriendly(pricing.local[1] * input.travellers * input.days);

  const estimatedMin = transportMin + hotelMin + foodMin + localMin;
  const estimatedMax = transportMax + hotelMax + foodMax + localMax;

  const optBudgetTransportMin = roundFriendly(pricing.transport[0] * input.travellers);
  const optBudgetTransportMax = roundFriendly(pricing.transport[1] * input.travellers);
  const optBudgetHotelMin = nights > 0 ? roundFriendly(pricing.hotelBudget[0] * (rooms || 1) * nights) : 0;
  const optBudgetHotelMax = nights > 0 ? roundFriendly(pricing.hotelBudget[1] * (rooms || 1) * nights) : 0;
  const optBudgetFoodMin = roundFriendly(300 * input.travellers * input.days);
  const optBudgetFoodMax = roundFriendly(600 * input.travellers * input.days);
  const optBudgetLocalMin = roundFriendly(Math.max(100, Math.round(pricing.local[0] * 0.7)) * input.travellers * input.days);
  const optBudgetLocalMax = roundFriendly(Math.max(200, Math.round(pricing.local[1] * 0.7)) * input.travellers * input.days);

  const optionBudgetMin = optBudgetTransportMin + optBudgetHotelMin + optBudgetFoodMin + optBudgetLocalMin;
  const optionBudgetMax = optBudgetTransportMax + optBudgetHotelMax + optBudgetFoodMax + optBudgetLocalMax;

  const optComfortTransportMin = roundFriendly(pricing.transport[0] * input.travellers);
  const optComfortTransportMax = roundFriendly(pricing.transport[1] * input.travellers);
  const optComfortHotelMin = nights > 0 ? roundFriendly(pricing.hotelStandard[0] * (rooms || 1) * nights) : 0;
  const optComfortHotelMax = nights > 0 ? roundFriendly(pricing.hotelStandard[1] * (rooms || 1) * nights) : 0;
  const optComfortFoodMin = roundFriendly(500 * input.travellers * input.days);
  const optComfortFoodMax = roundFriendly(1000 * input.travellers * input.days);
  const optComfortLocalMin = roundFriendly(pricing.local[0] * input.travellers * input.days);
  const optComfortLocalMax = roundFriendly(pricing.local[1] * input.travellers * input.days);

  const optionComfortMin = optComfortTransportMin + optComfortHotelMin + optComfortFoodMin + optComfortLocalMin;
  const optionComfortMax = optComfortTransportMax + optComfortHotelMax + optComfortFoodMax + optComfortLocalMax;

  const optPremiumTransportMin = roundFriendly(pricing.transport[0] * 1.5 * input.travellers);
  const optPremiumTransportMax = roundFriendly(pricing.transport[1] * 1.8 * input.travellers);
  const optPremiumHotelMin = nights > 0 ? roundFriendly(pricing.hotelPremium[0] * (rooms || 1) * nights) : 0;
  const optPremiumHotelMax = nights > 0 ? roundFriendly(pricing.hotelPremium[1] * (rooms || 1) * nights) : 0;
  const optPremiumFoodMin = roundFriendly(800 * input.travellers * input.days);
  const optPremiumFoodMax = roundFriendly(1500 * input.travellers * input.days);
  const optPremiumLocalMin = roundFriendly(pricing.local[0] * 1.4 * input.travellers * input.days);
  const optPremiumLocalMax = roundFriendly(pricing.local[1] * 1.4 * input.travellers * input.days);

  const optionPremiumMin = optPremiumTransportMin + optPremiumHotelMin + optPremiumFoodMin + optPremiumLocalMin;
  const optionPremiumMax = optPremiumTransportMax + optPremiumHotelMax + optPremiumFoodMax + optPremiumLocalMax;

  const remaining = totalBudget - estimatedTotal;

  const budget: BudgetBreakdown = {
    transport: transportEstimate,
    hotel: hotelEstimate,
    food: foodEstimate,
    local: localEstimate,
    transportMin,
    transportMax,
    hotelMin,
    hotelMax,
    foodMin,
    foodMax,
    localMin,
    localMax,
    transportTarget: targets.transport,
    hotelTarget: targets.hotel,
    foodTarget: targets.food,
    localTarget: targets.local,
    total: totalBudget,
    perPerson: input.budget,
    estimatedTotal,
    estimatedMin,
    estimatedMax,
    remaining,
    status: remaining >= 0 ? "within" : "over",
    hotelPerNight,
    hotelPerNightMin,
    hotelPerNightMax,
    rooms,
    optionBudgetMin,
    optionBudgetMax,
    optionComfortMin,
    optionComfortMax,
    optionPremiumMin,
    optionPremiumMax
  };

  const perDayCost = roundCurrency((foodEstimate + localEstimate) / Math.max(input.days, 1) / input.travellers);
  const itinerary = generateItinerary(dest, input.days, perDayCost, route);

  const distanceKm = route.reduce((sum, leg) => sum + leg.distanceKm, 0);

  const feasibility = calculateFeasibilityScore(input, dest, estimatedMin, distanceKm);
  const alternatives = getSmartAlternatives(input, dest, feasibility.score, dests, srcDest || dests[0]);

  const nearbyExperiences = dests
    .filter(d => d.id !== dest.id)
    .map(d => ({
      name: d.name,
      distanceKm: getDistance(dest.lat, dest.lng, d.lat, d.lng),
      type: categoryLabels[d.category] || d.category
    }))
    .filter(item => item.distanceKm <= 80 && item.distanceKm > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  const suggestedCircuits = buildDynamicCircuits(dest, dests);

  const bestTime = dest.category === "hill"
    ? "April–June"
    : dest.category === "beach"
      ? "October–March"
      : "October–February";

  const tips = [
    budget.status === "within"
      ? `This plan fits the budget with about ₹${budget.remaining.toLocaleString("en-IN")} left for tickets/snacks.`
      : `This plan is about ₹${Math.abs(budget.remaining).toLocaleString("en-IN")} above budget — reduce stay tier or shorten by 1 day.`,
    `Best season for ${dest.name}: ${bestTime}.`,
    route.some((leg) => leg.mode === "train")
      ? "Book train tickets early for the cheapest classes; keep a bus backup for last-mile travel."
      : "Government buses are usually the cheapest choice here, especially for flexible timings.",
    nights > 0 && hotels[0]
      ? `Aim for rooms around ₹${budget.hotelPerNight.toLocaleString("en-IN")}/night to stay inside the OG Sikkanam hotel budget slice.`
      : "This works well as a day trip, so you can skip hotel costs entirely.",
    "Carry small cash for autos, hill buses, and roadside food stalls even if UPI works in most places.",
  ];

  const intelligence = calculateTravelCostIntelligence(input, dest, route, hotels);

  return {
    input,
    route,
    budget,
    hotels,
    attractions: dest.attractions.slice(0, Math.min(input.days * 4, dest.attractions.length)),
    itinerary,
    destination: dest,
    tips,
    feasibility,
    alternatives,
    nearbyExperiences,
    suggestedCircuits,
    intelligence
  };
}

function calculateTravelCostIntelligenceDeprecated(
  input: TripInput,
  dest: TNDestination,
  route: RouteLeg[],
  hotels: Hotel[]
): any {
  const days = input.days;
  const travellers = input.travellers;
  const style = input.style;
  const nights = Math.max(days - 1, 0);
  const rooms = nights > 0 ? Math.ceil(travellers / (style === "budget" ? 3 : 2)) : 0;

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
    confidence: 100,
    confidenceReason: primaryLeg?.routeIntel?.routeStatus === "verified" ? "Verified via OSRM network route." : "Estimated using road distance defaults.",
    source: "OpenStreetMap Routing & Railway Station Mapping"
  };

  // --- 2. Hotel Component ---
  let hotelMin = 0;
  let hotelMax = 0;
  let hotelFormula = "Day trip (0 nights stay)";
  let hotelReason = "This is a day trip. No accommodation required.";
  let hotelSource = "N/A";
  let hotelMarketIntel: HotelMarketIntelligence | undefined;

  const observedHotelsCount = hotels.filter(h => h.name && !h.name.startsWith("Search hotels")).length;
  const isObserved = observedHotelsCount > 0;

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
    const rateMin = Math.round(baseMinRate * hotelFactor / 50) * 50;
    const rateMax = Math.round(baseMaxRate * hotelFactor / 50) * 50;

    let minObservedPrice = rateMin;
    let maxObservedPrice = rateMax;

    const observedHotelsList = hotels.map(hotel => {
      let pricePerNight = hotel.pricePerNight;
      if (!pricePerNight) {
        const cat = hotel.priceCategory || "standard";
        const base = HOTEL_RANGES[cat]?.min || 1500;
        const maxVal = HOTEL_RANGES[cat]?.max || 3000;
        const offset = (hotel.name.length % 5) * ((maxVal - base) / 5);
        pricePerNight = Math.round((base + offset) / 100) * 100;
      }
      return {
        name: hotel.name,
        priceCategory: hotel.priceCategory || "standard",
        rating: hotel.rating || 4.0,
        distanceKm: hotel.distanceKm || 1.0,
        pricePerNight
      };
    }).filter(h => !h.name.startsWith("Search hotels"));

    if (observedHotelsList.length > 0) {
      minObservedPrice = Math.min(...observedHotelsList.map(h => h.pricePerNight));
      maxObservedPrice = Math.max(...observedHotelsList.map(h => h.pricePerNight));
    }

    const minRecommendedPrice = minObservedPrice + (style === "budget" ? 200 : style === "comfort" ? 500 : 300);
    const maxRecommendedPrice = maxObservedPrice + (style === "budget" ? 300 : style === "comfort" ? 1000 : 500);

    hotelMin = minRecommendedPrice * rooms * nights;
    hotelMax = maxRecommendedPrice * rooms * nights;
    hotelFormula = `${nights} Nights × ${rooms} Rooms × Derived Rate (₹${minRecommendedPrice}–₹${maxRecommendedPrice}/night)`;
    hotelReason = isObserved 
      ? `Derived from local inventory observations (${observedHotelsCount} hotels) in ${dest.name}.`
      : `Estimated from standard ${style} tier rates in ${dest.name}.`;
    hotelSource = isObserved ? "Overpass OpenStreetMap Tourism API" : "Sikkanam Curated Hotel Database";

    hotelMarketIntel = {
      observedHotelsList,
      minObservedPrice,
      maxObservedPrice,
      minRecommendedPrice,
      maxRecommendedPrice,
      pricingEvidence: {
        source: isObserved ? "observed" : "estimated",
        reason: isObserved ? `Based on ${observedHotelsCount} local hotel matches` : "Derived using regional category averages",
        observedHotels: observedHotelsCount
      }
    };
  }

  const hotelDetail: CostComponentDetail = {
    name: "Hotels",
    min: hotelMin,
    max: hotelMax,
    formula: hotelFormula,
    reason: hotelReason,
    confidence: 100,
    confidenceReason: isObserved ? "Hotel prices derived from observed local listings." : "Hotel prices estimated from standard style averages.",
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
    confidence: 100,
    confidenceReason: "Food cost derived from meal-level food profile index.",
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
    confidence: 100,
    confidenceReason: "Estimated using travel style mobility parameters.",
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
      verificationSource: detail.verificationSource
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
    confidence: 100,
    confidenceReason: "Calculated using individual attraction fees.",
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
    confidence: 100,
    confidenceReason: "Standard risk margin based on trip size and duration.",
    source: "Sikkanam Risk Management Guidelines"
  };

  // --- Totals & Reliability/Checklist/Assumptions ---
  const minRequired = transportMin + hotelMin + foodMin + mobilityMin + activityMin + bufferMin;
  const maxSpend = transportMax + hotelMax + foodMax + mobilityMax + activityMax;
  const recommendedCarry = maxSpend + bufferMax;

  const transportComfort = Math.round((transportMin + transportMax) / 2 / 10) * 10;
  const hotelComfort = Math.round((hotelMin + hotelMax) / 2 / 50) * 50;
  const foodComfort = Math.round((foodMin + foodMax) / 2 / 10) * 10;
  const mobilityComfort = Math.round((mobilityMin + mobilityMax) / 2 / 10) * 10;
  const activityComfort = Math.round((activityMin + activityMax) / 2 / 10) * 10;
  const bufferComfort = Math.round((bufferMin + bufferMax) / 2 / 10) * 10;
  const comfortBudget = transportComfort + hotelComfort + foodComfort + mobilityComfort + activityComfort + bufferComfort;

  const evidenceChecklist: EvidenceChecklist = {
    roadRouteVerified: route.length > 0 && route.some(leg => leg.routeIntel?.routeStatus === "verified"),
    hotelInventoryAvailable: observedHotelsCount > 0,
    attractionDatabaseAvailable: attractionsList.length > 0,
    foodProfileAvailable: true,
    destinationMetadataAvailable: typeof dest.costIndex === "number" && dest.costIndex > 0
  };

  const verifiedCount = Object.values(evidenceChecklist).filter(Boolean).length;
  let reliability: BudgetReliability = "Moderate";
  if (verifiedCount === 5) reliability = "Very High";
  else if (verifiedCount === 4) reliability = "High";
  else if (verifiedCount === 3) reliability = "Moderate";
  else reliability = "Low";

  const verifiedItems = [];
  if (evidenceChecklist.roadRouteVerified) verifiedItems.push("Route Verified");
  if (evidenceChecklist.hotelInventoryAvailable) verifiedItems.push("Hotel Inventory Available");
  if (evidenceChecklist.attractionDatabaseAvailable) verifiedItems.push("Attraction Database Available");
  if (evidenceChecklist.foodProfileAvailable) verifiedItems.push("Food Cost Profile Available");
  if (evidenceChecklist.destinationMetadataAvailable) verifiedItems.push("Destination Cost Profile Available");

  const reliabilityReason = `Derived from checklist matches (${verifiedCount}/5): ${verifiedItems.join(", ")}.`;

  const assumptions: BudgetAssumptions = {
    travellerCount: travellers,
    tripDurationDays: days,
    hotelStyle: style === "budget" ? "Budget Lodges" : style === "comfort" ? "Premium Hotels" : "Standard Rooms",
    foodStyle: style === "budget" ? "Mess / Local Eateries" : style === "comfort" ? "Fine Dining / Restaurants" : "Standard Restaurants",
    transportStyle: primaryMode === "train" ? "Train (Sleeper) + Local Mobility" : (style === "comfort" ? "Private Bus / Cab + Local Mobility" : "Govt Bus + Local Mobility"),
    activityCoverage: "Top attractions listed in standard itinerary"
  };

  return {
    minRequired,
    comfortBudget,
    recommendedCarry,
    overallConfidence: 100,
    transparencyScore: 100,
    reliability,
    reliabilityReason,
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

const DESTINATION_GATEWAYS: Partial<Record<string, GatewayConfig>> = {
  ooty: {
    hub: "Mettupalayam",
    lastMileKm: 52,
    lastMileMode: "bus",
    lastMileDuration: "2h 15m",
    frequency: "every 45–60 min",
    note: "Usually cheaper to reach the foothill rail/bus hub first, then take the hill bus.",
  },
  coonoor: {
    hub: "Mettupalayam",
    lastMileKm: 34,
    lastMileMode: "bus",
    lastMileDuration: "1h 30m",
    frequency: "every 45 min",
    note: "Coonoor is usually best reached with a final hill bus leg.",
  },
  yercaud: {
    hub: "Salem",
    lastMileKm: 32,
    lastMileMode: "bus",
    lastMileDuration: "45m",
    frequency: "every 30 min",
    note: "Salem bus stand has frequent hill buses to Yercaud.",
  },
  kodaikanal: {
    hub: "Kodai Road",
    lastMileKm: 80,
    lastMileMode: "bus",
    lastMileDuration: "2h 30m",
    frequency: "every 45–60 min",
    note: "Kodai Road or nearby junctions are usually the cheapest transfer point.",
  },
  valparai: {
    hub: "Pollachi",
    lastMileKm: 65,
    lastMileMode: "bus",
    lastMileDuration: "2h 30m",
    frequency: "every 60 min",
    note: "Budget travellers typically change at Pollachi for the ghat bus.",
  },
  dhanushkodi: {
    hub: "Rameswaram",
    lastMileKm: 18,
    lastMileMode: "bus",
    lastMileDuration: "35m",
    frequency: "every 30–45 min",
    note: "Last-mile buses or shared vans run from Rameswaram to Dhanushkodi.",
  },
  mahabalipuram: {
    hub: "Chennai",
    lastMileKm: 58,
    lastMileMode: "bus",
    lastMileDuration: "1h 30m",
    frequency: "every 20–30 min",
    note: "Direct ECR buses are usually the most efficient last leg.",
  },
};

const FOOD_COST_PER_DAY: Record<TravelStyle, number> = {
  budget: 250,
  standard: 350,
  comfort: 550,
};

const LOCAL_COST_PER_DAY_BY_CATEGORY: Record<TNDestination["category"], number> = {
  hill: 220,
  beach: 170,
  temple: 140,
  city: 160,
  heritage: 150,
  wildlife: 240,
};

function roundCurrency(amount: number) {
  return Math.max(0, Math.round(amount / 10) * 10);
}

function getBudgetTargets(totalBudget: number) {
  return {
    transport: roundCurrency(totalBudget * 0.3),
    hotel: roundCurrency(totalBudget * 0.4),
    food: roundCurrency(totalBudget * 0.2),
    local: roundCurrency(totalBudget * 0.1),
  };
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function getTransportCost(distanceKm: number, mode: RouteLeg["mode"]) {
  if (mode === "train") return roundCurrency(distanceKm * 0.8);
  if (mode === "auto") return roundCurrency(distanceKm * 12);
  return roundCurrency(distanceKm * 1.2);
}

function getTransportDuration(distanceKm: number, mode: "bus" | "train") {
  const speed = mode === "bus" ? 42 : 55;
  const buffer = mode === "bus"
    ? distanceKm > 220 ? 30 : 10
    : distanceKm > 250 ? 20 : 10;

  return formatDuration(Math.max(20, Math.round((distanceKm / speed) * 60) + buffer));
}

function getBusFrequency(distanceKm: number) {
  if (distanceKm <= 60) return "every 20–30 min";
  if (distanceKm <= 180) return "every 45–60 min";
  return "3–6 departures/day";
}

function getTrainFrequency(distanceKm: number) {
  if (distanceKm <= 160) return "1–2 trains/day";
  if (distanceKm <= 350) return "2–4 trains/day";
  return "1–3 trains/day";
}

function getRoomCapacity(style: TravelStyle) {
  return style === "budget" ? 3 : 2;
}

function parseDurationToMinutes(durationStr: string): number {
  const hMatch = durationStr.match(/(\d+)\s*h/);
  const mMatch = durationStr.match(/(\d+)\s*m/);
  const hours = hMatch ? parseInt(hMatch[1]) : 0;
  const minutes = mMatch ? parseInt(mMatch[1]) : 0;
  return hours * 60 + minutes;
}

function buildDirectBusRoute(from: string, to: string, distanceKm: number, routeIntel: RouteIntelligence): RouteCandidate {
  return {
    totalCost: getTransportCost(distanceKm, "bus"),
    transferCount: 0,
    legs: [
      {
        from,
        to,
        mode: "bus",
        distanceKm,
        costPerPerson: getTransportCost(distanceKm, "bus"),
        duration: `${Math.floor(routeIntel.estimatedDurationMinutes / 60)}h ${routeIntel.estimatedDurationMinutes % 60}m`,
        frequency: getBusFrequency(distanceKm),
        note: "Direct bus connection.",
        routeIntel
      },
    ],
  };
}

function buildDirectTrainRoute(
  sourceName: string,
  destinationName: string,
  sourceStation: string,
  destinationStation: string,
  distanceKm: number,
  sourceHasRail: boolean,
  destHasRail: boolean,
  routeIntel: RouteIntelligence
): RouteCandidate | null {
  // Validate: only generate direct train if BOTH endpoints have rail access
  if (!sourceHasRail || !destHasRail) return null;
  if (distanceKm < 140) return null;

  return {
    totalCost: getTransportCost(distanceKm, "train"),
    transferCount: 0,
    preferredForComfort: true,
    legs: [
      {
        from: sourceName,
        to: destinationName,
        fromStation: sourceStation,
        toStation: destinationStation,
        mode: "train",
        distanceKm,
        costPerPerson: getTransportCost(distanceKm, "train"),
        duration: `${Math.floor(routeIntel.estimatedDurationMinutes / 60)}h ${routeIntel.estimatedDurationMinutes % 60}m`,
        frequency: getTrainFrequency(distanceKm),
        note: "Sleeper train estimate based on the cheapest practical route.",
        routeIntel
      },
    ],
  };
}

function buildGatewayRoute(
  sourceName: string,
  destinationName: string,
  totalDistance: number,
  gateway: GatewayConfig,
  primaryMode: "bus" | "train",
  sourceStation?: string,
  sourceHasRail?: boolean,
  routeIntel?: RouteIntelligence
): RouteCandidate | null {
  const mainDistance = Math.max(50, totalDistance - gateway.lastMileKm);
  
  // If using train as primary leg, validate source has rail access
  if (primaryMode === "train") {
    if (!sourceHasRail) return null;
    if (mainDistance < 140) return null;
  }

  const firstLegCost = getTransportCost(mainDistance, primaryMode);
  const lastMileCost = getTransportCost(gateway.lastMileKm, gateway.lastMileMode);

  let leg1Intel: RouteIntelligence | undefined;
  let leg2Intel: RouteIntelligence | undefined;

  if (routeIntel) {
    const leg1DurationMin = Math.round(routeIntel.estimatedDurationMinutes * (mainDistance / totalDistance));
    leg1Intel = {
      roadDistanceKm: mainDistance,
      estimatedDurationMinutes: leg1DurationMin,
      routeSource: "OSRM",
      routeStatus: routeIntel.routeStatus
    };

    leg2Intel = {
      roadDistanceKm: gateway.lastMileKm,
      estimatedDurationMinutes: parseDurationToMinutes(gateway.lastMileDuration) || 60,
      routeSource: "OSRM",
      routeStatus: "fallback"
    };
  }

  return {
    totalCost: firstLegCost + lastMileCost,
    transferCount: 1,
    preferredForComfort: primaryMode === "train",
    legs: [
      {
        from: sourceName,
        to: gateway.hub,
        fromStation: primaryMode === "train" ? sourceStation : undefined,
        toStation: primaryMode === "train" ? gateway.hub : undefined,
        mode: primaryMode,
        distanceKm: mainDistance,
        costPerPerson: firstLegCost,
        duration: getTransportDuration(mainDistance, primaryMode),
        frequency: primaryMode === "train" ? getTrainFrequency(mainDistance) : getBusFrequency(mainDistance),
        note: `Main intercity leg to ${gateway.hub}.`,
        routeIntel: leg1Intel
      },
      {
        from: gateway.hub,
        to: destinationName,
        mode: gateway.lastMileMode,
        distanceKm: gateway.lastMileKm,
        costPerPerson: lastMileCost,
        duration: gateway.lastMileDuration,
        frequency: gateway.frequency,
        note: gateway.note,
        routeIntel: leg2Intel
      },
    ],
  };
}

function pickBestRoute(options: RouteCandidate[], style: TravelStyle) {
  const viable = options.filter(Boolean).sort((a, b) => {
    if (a.totalCost !== b.totalCost) return a.totalCost - b.totalCost;
    return a.transferCount - b.transferCount;
  });

  const cheapest = viable[0];
  if (!cheapest) return [];

  if (style === "comfort") {
    const comfortable = viable.find((option) => option.preferredForComfort && option.totalCost <= cheapest.totalCost * 1.15);
    return (comfortable ?? cheapest).legs;
  }

  if (style === "standard") {
    const lowerTransfer = viable.find((option) => option.totalCost <= cheapest.totalCost + 80 && option.transferCount < cheapest.transferCount);
    return (lowerTransfer ?? cheapest).legs;
  }

  return cheapest.legs;
}

export async function getRoadDistanceAndStatus(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteIntelligence> {
  const fallbackDist = Math.round(getDistance(fromLat, fromLng, toLat, toLng) * 1.25);
  const fallbackDurationMin = Math.round((fallbackDist / 45) * 60);
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes[0]) {
        const roadDist = Math.round(data.routes[0].distance / 1000);
        const durationMin = Math.round(data.routes[0].duration / 60);
        if (roadDist > 0) {
          return {
            roadDistanceKm: roadDist,
            estimatedDurationMinutes: durationMin,
            routeSource: "OSRM",
            routeStatus: "verified"
          };
        }
      }
    }
  } catch (err) {
    console.warn("OSRM routing failed, using estimated road distance:", err);
  }
  return {
    roadDistanceKm: fallbackDist,
    estimatedDurationMinutes: fallbackDurationMin,
    routeSource: "OSRM",
    routeStatus: "fallback"
  };
}

async function calculateRoute(source: string, destination: string, style: TravelStyle): Promise<RouteLeg[]> {
  const srcDest = getDestinationById(source);
  const dstDest = getDestinationById(destination);

  if (!srcDest || !dstDest) return [];

  const routeIntel = await getRoadDistanceAndStatus(
    srcDest.lat,
    srcDest.lng,
    dstDest.lat,
    dstDest.lng
  );
  const distance = routeIntel.roadDistanceKm;
  const gateway = DESTINATION_GATEWAYS[destination];
  const options: RouteCandidate[] = [buildDirectBusRoute(srcDest.name, dstDest.name, distance, routeIntel)];

  const directTrain = buildDirectTrainRoute(
    srcDest.name,
    dstDest.name,
    srcDest.nearestStation,
    dstDest.nearestStation,
    distance,
    srcDest.hasRailAccess,
    dstDest.hasRailAccess,
    routeIntel
  );
  if (directTrain) options.push(directTrain);

  if (gateway) {
    const busViaGateway = buildGatewayRoute(srcDest.name, dstDest.name, distance, gateway, "bus", undefined, undefined, routeIntel);
    const trainViaGateway = buildGatewayRoute(srcDest.name, dstDest.name, distance, gateway, "train", srcDest.nearestStation, srcDest.hasRailAccess, routeIntel);
    if (busViaGateway) options.push(busViaGateway);
    if (trainViaGateway) options.push(trainViaGateway);
  }

  return pickBestRoute(options, style);
}

function filterHotels(dest: TNDestination, perNightBudget: number, style: TravelStyle): Hotel[] {
  const withinBudget = dest.hotels.filter((hotel) => HOTEL_RANGES[hotel.priceCategory].min <= perNightBudget * 1.15);
  const preferredTier = withinBudget.filter((hotel) => hotel.tier === style);
  const fallbackTier =
  withinBudget.length > 0
    ? withinBudget
    : dest.hotels.filter(
        (hotel) =>
          HOTEL_RANGES[hotel.priceCategory].min <=
          perNightBudget * 1.4
      );

  const pool = preferredTier.length > 0
    ? preferredTier
    : fallbackTier.length > 0
      ? fallbackTier
      : [...dest.hotels].sort(
  (a, b) =>
    HOTEL_RANGES[a.priceCategory].min -
    HOTEL_RANGES[b.priceCategory].min
);
  return [...pool]
    .sort((a, b) => {
      if (
  HOTEL_RANGES[a.priceCategory].min !==
  HOTEL_RANGES[b.priceCategory].min
)
  return (
    HOTEL_RANGES[a.priceCategory].min -
    HOTEL_RANGES[b.priceCategory].min
  );
      return b.rating - a.rating;
    })
    .slice(0, 3);
}

function getMealsForCategory(category: TNDestination["category"], day: number) {
  const mealsByCategory: Record<TNDestination["category"], string[]> = {
    hill: [
      "Tea stall breakfast, veg meals lunch, hot bajji + chai in the evening",
      "Idli or pongal breakfast, biryani lunch, roadside parotta dinner",
    ],
    beach: [
      "Idli-dosa breakfast, seafood/veg meals lunch, beachside snacks dinner",
      "Pongal breakfast, lemon rice lunch, fried fish or kuzhi paniyaram dinner",
    ],
    temple: [
      "Temple-side tiffin breakfast, banana leaf meals lunch, jigarthanda/snacks in the evening",
      "Mini tiffin breakfast, mess lunch, parotta-kurma dinner",
    ],
    city: [
      "Early breakfast near bus stand, meals lunch, budget biryani dinner",
      "Bakery breakfast, mess lunch, street-food dinner",
    ],
    heritage: [
      "South Indian breakfast, homely meals lunch, evening filter coffee + dinner",
      "Idiyappam breakfast, thali lunch, light tiffin dinner",
    ],
    wildlife: [
      "Packed breakfast, simple meals lunch, early dinner near stay",
      "Tea + buns breakfast, forest-side lunch, hot dinner at lodge",
    ],
  };

  const options = mealsByCategory[category];
  return options[day % options.length];
}

function generateItinerary(dest: TNDestination, days: number, perDayCost: number, route: RouteLeg[]): DayPlan[] {
  const attractions = [...dest.attractions];
  const attractionsPerDay = Math.max(1, Math.ceil(attractions.length / Math.max(days, 1)));
  const plans: DayPlan[] = [];

  for (let index = 0; index < days; index += 1) {
    const isFirstDay = index === 0;
    const isLastDay = index === days - 1;
    const dayAttractions = attractions.splice(0, attractionsPerDay);
    const activities: string[] = [];

    if (days === 1) {
      activities.push(`Start early from ${route[0]?.from ?? "your city"}`);
      activities.push(...dayAttractions.map((attraction) => `Visit ${attraction}`));
      activities.push(`Return from ${dest.name} by evening`);
    } else {
      if (isFirstDay) {
        activities.push(`Travel via ${route.map((leg) => `${leg.mode} to ${leg.to}`).join(" + ")}`);
        activities.push(`Check into stay and refresh in ${dest.name}`);
      }

      activities.push(...dayAttractions.map((attraction) => `Visit ${attraction}`));

      if (isLastDay) {
        activities.push("Check out, cover any missed nearby spots, and start return travel");
      } else if (!isFirstDay) {
        activities.push("Use local bus/auto for nearby attractions to save money");
      }
    }

    const title = days === 1
      ? "Day 1 – Smart Day Trip"
      : isFirstDay
        ? `Day ${index + 1} – Arrival & Local Start`
        : isLastDay
          ? `Day ${index + 1} – Wrap-up & Return`
          : `Day ${index + 1} – Core Exploration`;

    plans.push({
      day: index + 1,
      title,
      activities,
      meals: getMealsForCategory(dest.category, index),
      estimatedCost: perDayCost,
    });
  }

  return plans;
}



export function generateShareText(plan: TripPlan): string {
  const lines = [
    `🧳 *Sikkanam Trip Plan*`,
    `📍 ${plan.destination.name}`,
    `📅 ${plan.input.days} Days | 👥 ${plan.input.travellers} Travellers`,
    `💰 Budget: ₹${plan.budget.perPerson.toLocaleString("en-IN")}/person | Estimated total: ₹${plan.budget.estimatedTotal.toLocaleString("en-IN")}`,
    ``,
    `🚌 *Optimized Route:*`,
    ...plan.route.map((leg) => {
      const fromDisplay = leg.mode === "train" ? (leg.fromStation ?? leg.from) : leg.from;
      const toDisplay = leg.mode === "train" ? (leg.toStation ?? leg.to) : leg.to;
      return `  ${fromDisplay} → ${toDisplay} (${leg.mode}, ₹${leg.costPerPerson}, ${leg.duration})`;
    }),
    ``,
    plan.hotels.length > 0 ? `🏨 *Recommended Hotels:*` : `🏨 *Stay:*`,
    ...(plan.hotels.length > 0
      ? plan.hotels.map((hotel) => {
          const category = hotel.priceCategory || "standard";
          const range = HOTEL_RANGES[category];
          return `  ${hotel.name} - ₹${range.min}-₹${range.max} ⭐${hotel.rating}`;
        })
      : ["  Day trip option — no hotel needed"]),
    ``,
    `🗓️ *Itinerary:*`,
    ...plan.itinerary.map((day) => `  ${day.title}: ${day.activities.slice(0, 3).join(", ")}`),
    ``,
    `Generated by Sikkanam – Tamil Nadu Budget Travel Planner`,
  ];

  return lines.join("\n");
}
