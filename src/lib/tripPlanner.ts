import { getNearbyHotels } from "@/services/hotelservice";
import {
  getDistance,
  getDestinationById,
  type TNDestination,
  type Hotel
} from "@/data/tnDestinations";
import { HOTEL_RANGES } from "@/lib/hotelPrices";
import { CATEGORY_PRICING } from "@/data/categoryPricing";
import { roundFriendly } from "@/lib/utils";
export type TravelStyle = "budget" | "standard" | "comfort";

export interface TripInput {
  source: string;
  destination: string;
  days: number;
  travellers: number;
  style: TravelStyle;
  budget: number;
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

export interface TripPlan {
  input: TripInput;
  route: RouteLeg[];
  budget: BudgetBreakdown;
  hotels: Hotel[];
  attractions: string[];
  itinerary: DayPlan[];
  destination: TNDestination;
  tips: string[];
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

export const USE_BACKEND_API = false;

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

function buildDirectBusRoute(from: string, to: string, distanceKm: number): RouteCandidate {
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
        duration: getTransportDuration(distanceKm, "bus"),
        frequency: getBusFrequency(distanceKm),
        note: "Direct bus connection.",
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
  destHasRail: boolean
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
        duration: getTransportDuration(distanceKm, "train"),
        frequency: getTrainFrequency(distanceKm),
        note: "Sleeper train estimate based on the cheapest practical route.",
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
): RouteCandidate | null {
  const mainDistance = Math.max(50, totalDistance - gateway.lastMileKm);
  
  // If using train as primary leg, validate source has rail access
  if (primaryMode === "train") {
    if (!sourceHasRail) return null;
    if (mainDistance < 140) return null;
  }

  const firstLegCost = getTransportCost(mainDistance, primaryMode);
  const lastMileCost = getTransportCost(gateway.lastMileKm, gateway.lastMileMode);

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

function calculateRoute(source: string, destination: string, style: TravelStyle): RouteLeg[] {
  const srcDest = getDestinationById(source);
  const dstDest = getDestinationById(destination);

  if (!srcDest || !dstDest) return [];

  const distance = getDistance(
    srcDest.lat,
    srcDest.lng,
    dstDest.lat,
    dstDest.lng
  );
  const gateway = DESTINATION_GATEWAYS[destination];
  const options: RouteCandidate[] = [buildDirectBusRoute(srcDest.name, dstDest.name, distance)];

  const directTrain = buildDirectTrainRoute(
    srcDest.name,
    dstDest.name,
    srcDest.nearestStation,
    dstDest.nearestStation,
    distance,
    srcDest.hasRailAccess,
    dstDest.hasRailAccess
  );
  if (directTrain) options.push(directTrain);

  if (gateway) {
    const busViaGateway = buildGatewayRoute(srcDest.name, dstDest.name, distance, gateway, "bus");
    const trainViaGateway = buildGatewayRoute(srcDest.name, dstDest.name, distance, gateway, "train", srcDest.nearestStation, srcDest.hasRailAccess);
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

export async function generateTripPlan(input: TripInput): Promise<TripPlan> {
  const dest = getDestinationById(input.destination);
  if (!dest) throw new Error("Invalid destination");

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

  console.log(`[Hotel Audit] Destination: ${dest.name} | Lat: ${dest.lat} | Lng: ${dest.lng} | Nights: ${nights} | Loaded Hotels: ${hotels.length}`);

 const hotelEstimate =
  nights > 0
    ? targetHotelBudget
    : 0;

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

  // 1. Budget Explorer Option
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

  // 2. Comfort Traveler Option
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

  // 3. Premium Experience Option
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
    optionPremiumMax,
  };

  const perDayCost = roundCurrency((foodEstimate + localEstimate) / Math.max(input.days, 1) / input.travellers);
  const itinerary = generateItinerary(dest, input.days, perDayCost, route);

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

  return {
    input,
    route,
    budget,
    hotels,
    attractions: dest.attractions.slice(0, Math.min(input.days * 4, dest.attractions.length)),
    itinerary,
    destination: dest,
    tips,
  };
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
