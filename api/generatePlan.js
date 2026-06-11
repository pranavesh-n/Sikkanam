import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { calculateTravelCostIntelligence } from "../src/lib/intelligenceEngine.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPECIFIC_METADATA = {
  ooty: { costIndex: 4, mobilityProfile: "high", activityProfile: { freeAttractions: 8, paidAttractions: 3, averageEntryFee: 40 }, budgetReliability: 82 },
  kodaikanal: { costIndex: 5, mobilityProfile: "high", activityProfile: { freeAttractions: 6, paidAttractions: 4, averageEntryFee: 50 }, budgetReliability: 80 },
  yercaud: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 8, paidAttractions: 2, averageEntryFee: 30 }, budgetReliability: 88 },
  valparai: { costIndex: 4, mobilityProfile: "high", activityProfile: { freeAttractions: 6, paidAttractions: 2, averageEntryFee: 40 }, budgetReliability: 85 },
  chidambaram: { costIndex: 2, mobilityProfile: "low", activityProfile: { freeAttractions: 4, paidAttractions: 1, averageEntryFee: 25 }, budgetReliability: 95 },
  thanjavur: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 6, paidAttractions: 3, averageEntryFee: 40 }, budgetReliability: 92 },
  rameswaram: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 7, paidAttractions: 3, averageEntryFee: 30 }, budgetReliability: 90 },
  courtallam: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 5, paidAttractions: 1, averageEntryFee: 20 }, budgetReliability: 85 },
  madurai: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 8, paidAttractions: 2, averageEntryFee: 30 }, budgetReliability: 90 },
  pondicherry: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 7, paidAttractions: 3, averageEntryFee: 40 }, budgetReliability: 88 }
};

const CATEGORY_DEFAULTS = {
  hill: { costIndex: 4, mobilityProfile: "high", activityProfile: { freeAttractions: 5, paidAttractions: 3, averageEntryFee: 50 }, budgetReliability: 82 },
  beach: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 4, paidAttractions: 2, averageEntryFee: 30 }, budgetReliability: 88 },
  temple: { costIndex: 2, mobilityProfile: "low", activityProfile: { freeAttractions: 6, paidAttractions: 1, averageEntryFee: 20 }, budgetReliability: 95 },
  city: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 4, paidAttractions: 2, averageEntryFee: 40 }, budgetReliability: 90 },
  heritage: { costIndex: 3, mobilityProfile: "medium", activityProfile: { freeAttractions: 4, paidAttractions: 3, averageEntryFee: 40 }, budgetReliability: 92 },
  wildlife: { costIndex: 4, mobilityProfile: "high", activityProfile: { freeAttractions: 3, paidAttractions: 3, averageEntryFee: 100 }, budgetReliability: 85 }
};

// Helper to load destinations
function loadDestinations() {
  const destPath = path.join(__dirname, "destinations.json");
  const raw = fs.readFileSync(destPath, "utf-8");
  const rawDests = JSON.parse(raw);
  return rawDests.map(dest => {
    const specific = SPECIFIC_METADATA[dest.id] || {};
    const defaults = CATEGORY_DEFAULTS[dest.category] || {};
    return {
      ...dest,
      costIndex: specific.costIndex || defaults.costIndex || 3,
      mobilityProfile: specific.mobilityProfile || defaults.mobilityProfile || "medium",
      activityProfile: specific.activityProfile || defaults.activityProfile || { freeAttractions: 4, paidAttractions: 2, averageEntryFee: 30 },
      budgetReliability: specific.budgetReliability || defaults.budgetReliability || 90
    };
  });
}

const HOTEL_RANGES = {
  budget: { min: 800, max: 1500 },
  standard: { min: 1500, max: 3000 },
  comfort: { min: 3000, max: 5500 },
  premium: { min: 5500, max: 10000 },
};

const CATEGORY_PRICING = {
  hill: { transport: [700, 1200], hotelBudget: [1000, 2000], hotelStandard: [2000, 4000], hotelPremium: [4000, 8000], food: [500, 1000], local: [300, 800] },
  beach: { transport: [600, 1200], hotelBudget: [1200, 2500], hotelStandard: [2500, 4500], hotelPremium: [4500, 9000], food: [500, 1200], local: [400, 1000] },
  temple: { transport: [500, 1000], hotelBudget: [800, 1500], hotelStandard: [1500, 3000], hotelPremium: [3000, 6000], food: [400, 800], local: [200, 600] },
  city: { transport: [700, 1500], hotelBudget: [1200, 2500], hotelStandard: [2500, 5000], hotelPremium: [5000, 10000], food: [600, 1500], local: [400, 1200] },
  heritage: { transport: [600, 1200], hotelBudget: [1000, 2000], hotelStandard: [2000, 3500], hotelPremium: [3500, 7000], food: [500, 1000], local: [300, 700] },
  wildlife: { transport: [1000, 2000], hotelBudget: [1500, 3000], hotelStandard: [3000, 6000], hotelPremium: [6000, 12000], food: [600, 1200], local: [500, 1500] }
};

const FOOD_COST_PER_DAY = {
  budget: 250,
  standard: 350,
  comfort: 550,
};

const LOCAL_COST_PER_DAY_BY_CATEGORY = {
  hill: 220,
  beach: 170,
  temple: 140,
  city: 160,
  heritage: 150,
  wildlife: 240,
};

function roundCurrency(amount) {
  return Math.max(0, Math.round(amount / 10) * 10);
}

function roundFriendly(val) {
  return Math.round(val / 50) * 50;
}

function getBudgetTargets(totalBudget) {
  return {
    transport: roundCurrency(totalBudget * 0.3),
    hotel: roundCurrency(totalBudget * 0.4),
    food: roundCurrency(totalBudget * 0.2),
    local: roundCurrency(totalBudget * 0.1),
  };
}

function getRoomCapacity(style) {
  return style === "budget" ? 3 : 2;
}

function getDistance(fromLat, fromLng, toLat, toLng) {
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
}

function getTransportCost(distanceKm, mode) {
  if (mode === "train") return roundCurrency(distanceKm * 0.8);
  if (mode === "auto") return roundCurrency(distanceKm * 12);
  return roundCurrency(distanceKm * 1.2);
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function getTransportDuration(distanceKm, mode) {
  const speed = mode === "bus" ? 42 : 55;
  const buffer = mode === "bus" ? (distanceKm > 220 ? 30 : 10) : (distanceKm > 250 ? 20 : 10);
  return formatDuration(Math.max(20, Math.round((distanceKm / speed) * 60) + buffer));
}

function getBusFrequency(distanceKm) {
  if (distanceKm <= 60) return "every 20–30 min";
  if (distanceKm <= 180) return "every 45–60 min";
  return "3–6 departures/day";
}

function getTrainFrequency(distanceKm) {
  if (distanceKm <= 160) return "1–2 trains/day";
  if (distanceKm <= 350) return "2–4 trains/day";
  return "1–3 trains/day";
}

function buildDirectBusRoute(from, to, distanceKm, routeIntel) {
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
        routeIntel,
      },
    ],
  };
}

function buildDirectTrainRoute(
  sourceName,
  destinationName,
  sourceStation,
  destinationStation,
  distanceKm,
  sourceHasRail,
  destHasRail,
  routeIntel
) {
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
        routeIntel,
      },
    ],
  };
}

const DESTINATION_GATEWAYS = {
  ooty: { hub: "Mettupalayam", lastMileKm: 52, lastMileMode: "bus", lastMileDuration: "2h 15m", frequency: "every 45–60 min", note: "Usually cheaper to reach the foothill rail/bus hub first, then take the hill bus." },
  coonoor: { hub: "Mettupalayam", lastMileKm: 34, lastMileMode: "bus", lastMileDuration: "1h 30m", frequency: "every 45 min", note: "Coonoor is usually best reached with a final hill bus leg." },
  yercaud: { hub: "Salem", lastMileKm: 32, lastMileMode: "bus", lastMileDuration: "45m", frequency: "every 30 min", note: "Salem bus stand has frequent hill buses to Yercaud." },
  kodaikanal: { hub: "Kodai Road", lastMileKm: 80, lastMileMode: "bus", lastMileDuration: "2h 30m", frequency: "every 45–60 min", note: "Kodai Road or nearby junctions are usually the cheapest transfer point." },
  valparai: { hub: "Pollachi", lastMileKm: 65, lastMileMode: "bus", lastMileDuration: "2h 30m", frequency: "every 60 min", note: "Budget travellers typically change at Pollachi for the ghat bus." },
  dhanushkodi: { hub: "Rameswaram", lastMileKm: 18, lastMileMode: "bus", lastMileDuration: "35m", frequency: "every 30–45 min", note: "Last-mile buses or shared vans run from Rameswaram to Dhanushkodi." },
  mahabalipuram: { hub: "Chennai", lastMileKm: 58, lastMileMode: "bus", lastMileDuration: "1h 30m", frequency: "every 20–30 min", note: "Direct ECR buses are usually the most efficient last leg." }
};

function buildGatewayRoute(
  sourceName,
  destinationName,
  totalDistance,
  gateway,
  primaryMode,
  sourceStation,
  sourceHasRail,
  routeIntel
) {
  const mainDistance = Math.max(50, totalDistance - gateway.lastMileKm);
  if (primaryMode === "train") {
    if (!sourceHasRail) return null;
    if (mainDistance < 140) return null;
  }

  const firstLegCost = getTransportCost(mainDistance, primaryMode);
  const lastMileCost = getTransportCost(gateway.lastMileKm, gateway.lastMileMode);

  let leg1Intel;
  let leg2Intel;
  if (routeIntel) {
    const leg1DurationMin = Math.round(routeIntel.estimatedDurationMinutes * (mainDistance / totalDistance));
    leg1Intel = {
      roadDistanceKm: mainDistance,
      estimatedDurationMinutes: leg1DurationMin,
      routeSource: routeIntel.routeSource,
      routeStatus: routeIntel.routeStatus
    };
    const leg2DurationMin = Math.round(routeIntel.estimatedDurationMinutes * (gateway.lastMileKm / totalDistance));
    leg2Intel = {
      roadDistanceKm: gateway.lastMileKm,
      estimatedDurationMinutes: leg2DurationMin,
      routeSource: routeIntel.routeSource,
      routeStatus: routeIntel.routeStatus
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

function pickBestRoute(options, style) {
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

async function getRoadDistanceAndStatus(fromLat, fromLng, toLat, toLng) {
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

async function calculateRoute(srcDest, dstDest, style) {
  const routeIntel = await getRoadDistanceAndStatus(srcDest.lat, srcDest.lng, dstDest.lat, dstDest.lng);
  const distance = routeIntel.roadDistanceKm;
  const gateway = DESTINATION_GATEWAYS[dstDest.id];
  const options = [buildDirectBusRoute(srcDest.name, dstDest.name, distance, routeIntel)];

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

// Decision Helpers
function getPredefinedCircuit(destId) {
  const templeCircuit = ["chidambaram", "kumbakonam", "thanjavur"];
  const hillCircuit = ["ooty", "coonoor", "coimbatore"];
  const waterfallCircuit = ["courtallam", "tirunelveli"];
  if (templeCircuit.includes(destId)) {
    return { name: "Chola Temple Circuit 🛕", route: ["Chidambaram", "Kumbakonam", "Thanjavur"], description: "Explore the architectural wonders of the Chola Dynasty, connecting grand temple towns." };
  }
  if (hillCircuit.includes(destId)) {
    return { name: "Nilgiris Hill Circuit 🏔️", route: ["Ooty", "Coonoor"], description: "Soak in the serene tea valleys, mountain railways, and viewpoints of Nilgiris." };
  }
  if (waterfallCircuit.includes(destId)) {
    return { name: "Southern Waterfall Circuit 💦", route: ["Courtallam", "Papanasam", "Tirunelveli"], description: "Refresh yourself with medicinal waters, mountain dams, and historic temples." };
  }
  return null;
}

function buildDynamicCircuits(dest, allDests) {
  const circuits = [];
  const predefined = getPredefinedCircuit(dest.id);
  if (predefined) circuits.push(predefined);

  const closeMatches = allDests
    .filter(d => d.id !== dest.id && d.category === dest.category)
    .map(d => ({ d, dist: getDistance(dest.lat, dest.lng, d.lat, d.lng) }))
    .filter(item => item.dist <= 80)
    .sort((a, b) => a.dist - b.dist);

  if (closeMatches.length >= 2) {
    const route = [dest.name, ...closeMatches.slice(0, 2).map(item => item.d.name)];
    let circuitName = `Custom ${dest.category.charAt(0).toUpperCase() + dest.category.slice(1)} Circuit 🗺️`;
    let circuitDesc = `A rich experience routing: ${route.join(" → ")}.`;
    if (dest.category === "temple") {
      circuitName = "Custom Temple Circuit 🛕";
      circuitDesc = `A cluster of close spiritual locations: ${route.join(" → ")}.`;
    } else if (dest.category === "hill") {
      circuitName = "Custom Hill Circuit 🏔️";
      circuitDesc = `Escape to multiple mountain getaways: ${route.join(" → ")}.`;
    }
    if (!predefined || predefined.route[0] !== route[0]) {
      circuits.push({ name: circuitName, route, description: circuitDesc });
    }
  }
  return circuits;
}

function calculateFeasibilityScore(input, dest, estimatedMinTotal, distanceKm) {
  const reasons = [];
  const distancePerDay = distanceKm / input.days;
  let distScore = 100;
  if (input.days === 1 && distanceKm > 150) {
    distScore = Math.max(10, 100 - (distanceKm - 150) * 0.8);
    reasons.push("✗ Travel distance too high for a one-day trip");
  } else if (distancePerDay > 250) {
    distScore = Math.max(10, 100 - (distancePerDay - 250) * 0.5);
    reasons.push("✗ Travel distance too high relative to trip duration");
  }

  const userTotalBudget = input.budget * input.travellers;
  let budgetScore = 100;
  if (userTotalBudget < estimatedMinTotal) {
    budgetScore = Math.max(10, Math.round((userTotalBudget / estimatedMinTotal) * 100));
    reasons.push("✗ Budget insufficient");
  }

  const recommendedDays = dest.recommendedDays || 2;
  let durationScore = 100;
  if (input.days < recommendedDays) {
    durationScore = Math.max(20, 100 - (recommendedDays - input.days) * 35);
    reasons.push("✗ Trip duration too short");
  }

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

  let travellerScore = 100;
  const difficulty = dest.difficulty || "easy";
  if (input.travellerType === "seniors" && difficulty === "challenging") {
    travellerScore = 40;
    reasons.push("✗ Sightseeing locations require strenuous trekking");
  } else if (input.travellerType === "family" && difficulty === "challenging") {
    travellerScore = 70;
    reasons.push("✗ Rugged terrain less suitable for families");
  }

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

  const score = Math.round((distScore + budgetScore + durationScore + transportScore + travellerScore + accomScore) / 6);
  let grade = "Possible";
  if (score >= 85) grade = "Highly Recommended";
  else if (score >= 60) grade = "Good Choice";
  else if (score >= 40) grade = "Possible";
  else grade = "Not Recommended";

  return { score, grade, reasons };
}

function scoreDestinationForRecommendation(input, dest, srcDest) {
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

  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
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

  const matchScore = Math.round((budgetMatch + accessibility + seasonMatch + travellerMatch + durationMatch) / 5);

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

function getSmartAlternatives(input, currentDest, currentFeasibility, allDests, srcDest) {
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
    return { destId: item.destId, name: item.name, matchScore: item.matchScore, reasonBetter };
  });
}

function generateItinerary(dest, days, perDayCost, route) {
  const attractions = [...dest.attractions];
  const attractionsPerDay = Math.max(1, Math.ceil(attractions.length / Math.max(days, 1)));
  const plans = [];

  for (let index = 0; index < days; index += 1) {
    const isFirstDay = index === 0;
    const isLastDay = index === days - 1;
    const dayAttractions = attractions.splice(0, attractionsPerDay);
    const activities = [];

    if (days === 1) {
      activities.push(`Start early from ${route[0]?.from || "your city"}`);
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
      meals: "Vegetarian breakfast, South Indian thali lunch, regional dinner snacks",
      estimatedCost: perDayCost,
    });
  }
  return plans;
}

const HOTEL_FALLBACKS = {
  ooty: [
    { name: "Savoy - Ooty", priceCategory: "comfort", rating: 4.3, type: "comfort", amenities: ["WiFi", "Breakfast"] },
    { name: "Fortune Resort - Ooty", priceCategory: "standard", rating: 4.0 },
  ],
  kodaikanal: [
    { name: "Kodai Lake Resort", priceCategory: "comfort", rating: 4.2 },
    { name: "Green Wood", priceCategory: "standard", rating: 4.0 },
  ],
  madurai: [
    { name: "GRT Palace", priceCategory: "comfort", rating: 4.2 },
    { name: "Solaikannan", priceCategory: "standard", rating: 3.9 },
  ],
  chennai: [
    { name: "The Park Chennai", priceCategory: "comfort", rating: 4.1 },
    { name: "Hotel Savera", priceCategory: "comfort", rating: 4.0 },
  ],
  coimbatore: [
    { name: "Hotel Vydyash", priceCategory: "standard", rating: 4.0 },
  ],
  rameswaram: [
    { name: "Temple View Hotel", priceCategory: "standard", rating: 4.0 },
  ],
  kanyakumari: [
    { name: "Seaview Resort", priceCategory: "comfort", rating: 4.1 },
  ],
  mahabalipuram: [
    { name: "Shoreline Retreat", priceCategory: "standard", rating: 4.0 },
  ],
};

async function getNearbyHotels(destId, lat, lng) {
  const query = `
    [out:json];
    (
      nwr["tourism"="hotel"](around:15000,${lat},${lng});
      nwr["tourism"="guest_house"](around:15000,${lat},${lng});
      nwr["tourism"="hostel"](around:15000,${lat},${lng});
    );
    out center;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (res.ok) {
      const data = await res.json();
      const mapped = (data.elements || []).map((hotel) => {
        const name = hotel.tags?.name || hotel.tags?.["name:en"] || hotel.tags?.brand || hotel.tags?.operator || null;
        if (!name) return null;

        const hotelLat = hotel.lat || hotel.center?.lat;
        const hotelLon = hotel.lon || hotel.center?.lon;
        if (!hotelLat || !hotelLon) return null;

        const distance = getDistance(lat, lng, hotelLat, hotelLon);
        const baseId = hotel.id || 100;
        const stableOffset = (baseId % 10) / 10;
        const rating = parseFloat((3.8 + stableOffset).toFixed(1));

        // Basic priceCategory resolver
        let category = "standard";
        const lowerName = name.toLowerCase();
        if (lowerName.includes("resort") || lowerName.includes("spa") || lowerName.includes("palace") || lowerName.includes("luxury")) {
          category = "premium";
        } else if (lowerName.includes("inn") || lowerName.includes("suites") || lowerName.includes("residency") || lowerName.includes("plaza")) {
          category = "comfort";
        } else if (lowerName.includes("lodge") || lowerName.includes("hostel") || hotel.tags?.tourism === "hostel" || hotel.tags?.tourism === "guest_house") {
          category = "budget";
        }

        return {
          name,
          priceCategory: category,
          tier: category.charAt(0).toUpperCase() + category.slice(1),
          distanceKm: parseFloat(distance.toFixed(1)),
          rating: rating,
          amenities: ["WiFi", "Hot Water"],
          lat: hotelLat,
          lng: hotelLon,
        };
      }).filter(h => h);

      // Deduplicate by name
      const uniqueMap = new Map();
      for (const h of mapped) {
        const key = `${h.name.toLowerCase()}|${h.lat}|${h.lng}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, h);
        }
      }
      const unique = Array.from(uniqueMap.values());
      unique.sort((a, b) => a.distanceKm - b.distanceKm);
      if (unique.length > 0) return unique.slice(0, 6);
    }
  } catch (err) {
    console.error("OSRM/Overpass API hotels query failed:", err);
  }

  // Fallback curated database
  const curated = HOTEL_FALLBACKS[destId] || [];
  if (curated.length > 0) {
    return curated.map((entry, idx) => {
      const offset = 0.01 * (idx + 1);
      const hotelLat = lat + offset;
      const hotelLng = lng + (offset * ((idx % 2 === 0) ? 1 : -1));
      const distance = getDistance(lat, lng, hotelLat, hotelLng);
      const priceCategory = entry.priceCategory || "standard";
      return {
        name: entry.name,
        priceCategory,
        tier: priceCategory.charAt(0).toUpperCase() + priceCategory.slice(1),
        distanceKm: parseFloat(distance.toFixed(1)),
        rating: entry.rating || 4.0,
        amenities: entry.amenities || ["WiFi"],
        lat: hotelLat,
        lng: hotelLng,
      };
    }).slice(0, 3);
  }
  const capitalized = destId.charAt(0).toUpperCase() + destId.slice(1);
  return [
    {
      name: `${capitalized} Gate View Lodge`,
      priceCategory: "budget",
      tier: "Budget",
      distanceKm: 0.8,
      rating: 4.1,
      amenities: ["WiFi", "Hot Water"],
      lat: lat + 0.005,
      lng: lng - 0.005
    },
    {
      name: `Hotel ${capitalized} Residency`,
      priceCategory: "standard",
      tier: "Standard",
      distanceKm: 1.2,
      rating: 4.3,
      amenities: ["WiFi", "Hot Water", "AC"],
      lat: lat + 0.01,
      lng: lng + 0.01
    },
    {
      name: `Grand ${capitalized} Park & Suites`,
      priceCategory: "comfort",
      tier: "Comfort",
      distanceKm: 1.8,
      rating: 4.5,
      amenities: ["WiFi", "Hot Water", "AC", "Breakfast"],
      lat: lat - 0.008,
      lng: lng + 0.008
    }
  ];
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const input = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const dests = loadDestinations();
    const srcDest = dests.find(d => d.id === input.source);
    const dest = dests.find(d => d.id === input.destination);

    if (!srcDest || !dest) {
      return res.status(400).json({ error: "Invalid source or destination" });
    }

    // Client-equivalent calculations
    const totalBudget = input.budget * input.travellers;
    const nights = Math.max(input.days - 1, 0);
    const route = await calculateRoute(srcDest, dest, input.style);
    const targets = getBudgetTargets(totalBudget);

    const roundTripPerPerson = route.reduce((sum, leg) => sum + leg.costPerPerson, 0) * 2;
    const transportEstimate = roundCurrency(Math.min(roundTripPerPerson * input.travellers, targets.transport));

    const targetHotelBudget = nights > 0 ? targets.hotel : 0;
    const rooms = nights > 0 ? Math.ceil(input.travellers / getRoomCapacity(input.style)) : 0;
    const hotelPerNight = nights > 0 && rooms > 0 ? roundCurrency(targetHotelBudget / nights / rooms) : 0;
    
    // Hotels list (synthetic fallbacks for backend serverless execution)
    const hotels = await getNearbyHotels(dest.id, dest.lat, dest.lng);

    const hotelEstimate = nights > 0 ? targetHotelBudget : 0;

    const foodPerPersonPerDay = FOOD_COST_PER_DAY[input.style] + (dest.category === "hill" || dest.category === "wildlife" ? 40 : 0);
    const foodEstimate = roundCurrency(Math.min(foodPerPersonPerDay * input.days * input.travellers, targets.food));

    const localPerPersonPerDay = LOCAL_COST_PER_DAY_BY_CATEGORY[dest.category];
    const localEstimate = roundCurrency(Math.min(localPerPersonPerDay * input.days * input.travellers, targets.local));

    const estimatedTotal = transportEstimate + hotelEstimate + foodEstimate + localEstimate;
    
    const pricing = CATEGORY_PRICING[dest.category] || CATEGORY_PRICING.city;

    let hotelRange;
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

    const budget = {
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
    const alternatives = getSmartAlternatives(input, dest, feasibility.score, dests, srcDest);

    const nearbyExperiences = dests
      .filter(d => d.id !== dest.id)
      .map(d => ({
        name: d.name,
        distanceKm: getDistance(dest.lat, dest.lng, d.lat, d.lng),
        type: d.category
      }))
      .filter(item => item.distanceKm <= 80 && item.distanceKm > 0)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 4);

    const suggestedCircuits = buildDynamicCircuits(dest, dests);

    const intelligence = calculateTravelCostIntelligence(input, dest, route, hotels);

    const plan = {
      input,
      route,
      budget,
      hotels,
      attractions: dest.attractions.slice(0, Math.min(input.days * 4, dest.attractions.length)),
      itinerary,
      destination: dest,
      tips: [
        `Recommended stay: ${dest.recommendedDays || 2} days.`
      ],
      feasibility,
      alternatives,
      nearbyExperiences,
      suggestedCircuits,
      intelligence
    };

    // AI Companion Prompt (strictly storytelling, narrative generated after planning is complete)
    const prompt = `
You are the Sikkanam AI Travel Companion, a storytelling narrative generator.
Your role is to build a rich day-wise itinerary description, photography spots, local food suggestions, packing checklists, and travel tips based on the structured plan details provided.

CRITICAL RULES:
- You must NEVER calculate or estimate transport costs, fares, hotel prices, entrance fees, distances, or feasibility scores. All calculations are already finalized by the deterministic engine.
- You must NOT suggest modifying the budget, calculations, or fares.
- Keep your tone practical, budget-conscious, and friendly.
- Format the output in clean, readable Markdown.
`;

    const payload = `
Destination: ${dest.name}
District: ${dest.district}
Days: ${input.days} Days
Traveller Type: ${input.travellerType}
Travel Style: ${input.style}
Route: ${JSON.stringify(route.map(r => `${r.from} to ${r.to} via ${r.mode}`))}
Budget: ${input.style} Tier range
Attractions: ${plan.attractions.join(", ")}
Nearby Experiences: ${JSON.stringify(nearbyExperiences)}
Suggested Circuits: ${JSON.stringify(suggestedCircuits)}
`;

    let reply = "";
    if (GEMINI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${prompt}\n\nUser structured data:\n${payload}`
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
              }
            })
          }
        );

        const data = await response.json();
        if (
          data.candidates &&
          data.candidates[0] &&
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts[0]
        ) {
          reply = data.candidates[0].content.parts[0].text;
        } else {
          reply = "No response from AI companion";
        }
      } catch (err) {
        console.warn("AI companion failed:", err);
        reply = "Sikkanam AI companion is currently offline. Your budget is fully generated above.";
      }
    } else {
      reply = "AI Travel Companion is offline (API key not configured). Your budget and route calculations are fully detailed above.";
    }

    plan.aiItinerary = reply;

    return res.status(200).json({ plan });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}

function calculateTravelCostIntelligenceDeprecated(input, dest, route, hotels) {
  const days = input.days;
  const travellers = input.travellers;
  const style = input.style;
  const nights = Math.max(days - 1, 0);
  const rooms = nights > 0 ? Math.ceil(travellers / (style === "budget" ? 3 : 2)) : 0;

  const costIndex = dest.costIndex || 3;
  const reliability = dest.budgetReliability || 90;
  const mobilityProfile = dest.mobilityProfile || "medium";
  const activityProfile = dest.activityProfile || { freeAttractions: 4, paidAttractions: 2, averageEntryFee: 30 };

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

  // Dynamic Transport Confidence
  const distanceCertainty = 98;
  const routeCertainty = route.length <= 1 ? 95 : 90;
  const modeCertainty = primaryMode === "train" ? 97 : 90;
  const dataCertainty = primaryLeg && primaryLeg.frequency ? 95 : 85;
  const transportConfidence = Math.round(distanceCertainty * 0.4 + routeCertainty * 0.3 + modeCertainty * 0.2 + dataCertainty * 0.1);

  const transportDetail = {
    name: "Transport",
    min: transportMin,
    max: transportMax,
    formula: transportFormula,
    reason: distanceKm > 0 
      ? `Based on intercity distance of ${distanceKm} km from ${input.source.toUpperCase()} to ${input.destination.toUpperCase()}.`
      : "Source and destination are the same.",
    confidence: transportConfidence,
    confidenceReason: `Distance certainty is ${distanceCertainty}%. Route certainty is ${routeCertainty}%. Mode certainty is ${modeCertainty}%.`,
    source: "Sikkanam OSRM & Indian Railway Fares"
  };

  // --- 2. Hotel Component ---
  let hotelMin = 0;
  let hotelMax = 0;
  let hotelFormula = "Day trip (0 nights stay)";
  let hotelReason = "This is a day trip. No accommodation required.";
  let hotelConfidence = 100;
  let hotelConfidenceReason = "No accommodation stay required.";
  let hotelSource = "N/A";

  if (nights > 0) {
    const hotelFactor = 1 + (costIndex - 3) * 0.15;
    let baseMinRate = 1500;
    let baseMaxRate = 3000;
    if (style === "budget") {
      baseMinRate = 1200;
      baseMaxRate = 1800;
    } else if (style === "comfort") {
      baseMinRate = 3000;
      baseMaxRate = 6000;
    }

    const rateMin = Math.round(baseMinRate * hotelFactor / 50) * 50;
    const rateMax = Math.round(baseMaxRate * hotelFactor / 50) * 50;
    hotelMin = rateMin * rooms * nights;
    hotelMax = rateMax * rooms * nights;
    hotelFormula = `${nights} Nights × ${rooms} Rooms × Room Rate (₹${rateMin}–₹${rateMax}/night)`;

    const apiHotelsCount = hotels.filter(h => h.name && !h.name.includes("Search hotels")).length;
    if (apiHotelsCount > 0) {
      hotelConfidence = Math.round(80 + Math.min(16, apiHotelsCount * 1.33));
      hotelReason = `Based on ${apiHotelsCount} hotels found within 15 km of ${dest.name}.`;
      hotelConfidenceReason = `Actual Overpass OpenStreetMap hotel discovery details available (${apiHotelsCount} spots).`;
      hotelSource = "Overpass OpenStreetMap Tourism API";
    } else {
      hotelConfidence = 72;
      hotelReason = `Based on curated fallback hotel rates near ${dest.name}.`;
      hotelConfidenceReason = "No live Overpass API hotels found; using curated fallback database.";
      hotelSource = "Sikkanam Curated Hotel Database";
    }
  }

  const hotelDetail = {
    name: "Hotels",
    min: hotelMin,
    max: hotelMax,
    formula: hotelFormula,
    reason: hotelReason,
    confidence: hotelConfidence,
    confidenceReason: hotelConfidenceReason,
    source: hotelSource
  };

  // --- 3. Food Component ---
  const foodFactor = 1 + (costIndex - 3) * 0.15;
  let dailyFoodMin = 520;
  let dailyFoodMax = 830;
  if (style === "budget") {
    dailyFoodMin = 340;
    dailyFoodMax = 540;
  } else if (style === "comfort") {
    dailyFoodMin = 840;
    dailyFoodMax = 1450;
  }

  const foodMinRate = Math.round(dailyFoodMin * foodFactor / 10) * 10;
  const foodMaxRate = Math.round(dailyFoodMax * foodFactor / 10) * 10;
  const foodMin = foodMinRate * days * travellers;
  const foodMax = foodMaxRate * days * travellers;

  const categoryReliability = dest.category === "temple" ? 95 : dest.category === "hill" ? 85 : 90;
  const foodConfidence = Math.round(reliability * 0.6 + categoryReliability * 0.2 + 90 * 0.2);

  const foodDetail = {
    name: "Food",
    min: foodMin,
    max: foodMax,
    formula: `Days (${days}) × Travellers (${travellers}) × Daily Food Range (₹${foodMinRate}–₹${foodMaxRate}/day)`,
    reason: `Based on costIndex of ${costIndex}/5 for ${dest.category} category in ${dest.district}.`,
    confidence: foodConfidence,
    confidenceReason: `Destination reliability is ${reliability}%. Category reliability is ${categoryReliability}%.`,
    source: "Sikkanam Destination Cost Profiles"
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

  const spreadCertainty = mobilityProfile === "low" ? 95 : mobilityProfile === "medium" ? 90 : 80;
  const mobilityConfidence = Math.round(reliability * 0.6 + spreadCertainty * 0.4);

  const mobilityDetail = {
    name: "Local Mobility",
    min: mobilityMin,
    max: mobilityMax,
    formula: `Days (${days}) × Daily Mobility Profile (₹${dailyMobilityMin}–₹${dailyMobilityMax}/day)`,
    reason: `Based on attraction spread (mobility profile: ${mobilityProfile}) and travel style.`,
    confidence: mobilityConfidence,
    confidenceReason: `Destination reliability is ${reliability}%. Spread profile certainty is ${spreadCertainty}%.`,
    source: "Sikkanam Local Mobility Profile Mapping"
  };

  // --- 5. Activity Component ---
  const freeSpots = activityProfile.freeAttractions;
  const paidSpots = activityProfile.paidAttractions;
  const avgEntryFee = activityProfile.averageEntryFee;

  const activityMin = paidSpots * avgEntryFee * travellers;
  const activityMax = Math.round((paidSpots * avgEntryFee * travellers + (50 * days * travellers)) / 50) * 50;

  const activityConfidence = Math.round(100 - (paidSpots / (freeSpots + paidSpots)) * 30);

  const activityDetail = {
    name: "Activities",
    min: activityMin,
    max: activityMax,
    formula: `(Paid Attractions [${paidSpots}] × Avg Fee [₹${avgEntryFee}] × ${travellers} Pax) + Buffer`,
    reason: `Based on destination attraction profile (${freeSpots} free spots, ${paidSpots} paid spots, and average fee of ₹${avgEntryFee}).`,
    confidence: activityConfidence,
    confidenceReason: `Certainty is high due to detailed attraction count (${freeSpots + paidSpots} mapped spots).`,
    source: "Sikkanam Destination Attraction Profiles"
  };

  // --- 6. Emergency Buffer Component ---
  const bufferMin = 250 * days * travellers;
  const bufferMax = 500 * days * travellers;

  const bufferDetail = {
    name: "Emergency Buffer",
    min: bufferMin,
    max: bufferMax,
    formula: `Daily Buffer (₹250–₹500) × Days (${days}) × Travellers (${travellers})`,
    reason: "To cover unexpected local transport, extra meals, and small purchases.",
    confidence: 95,
    confidenceReason: "Standard risk margin based on trip size and duration.",
    source: "Sikkanam Risk Management Guidelines"
  };

  // --- Totals & Score Calculations ---
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

  const overallConfidence = Math.round(
    (transportConfidence + hotelConfidence + foodConfidence + mobilityConfidence + activityConfidence) / 5
  );

  const explainedComponents = 6;
  const totalComponents = 6;
  const transparencyScore = Math.round((explainedComponents / totalComponents) * 100);

  return {
    minRequired,
    comfortBudget,
    recommendedCarry,
    overallConfidence,
    transparencyScore,
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
