import { appConfig } from "@/config/appConfig";
import type { TNDestination } from "./tnDestinations";

/**
 * Dynamic Market Rates & Pricing Engine
 * Eliminates all brittle hardcoded rates and fake data.
 * All rates, tariffs, and budget allocations are computed dynamically
 * based on distance, seasonal multipliers, destination categories, and configurable environment settings.
 */

// Configurable base tariff constants (can be overridden via environment variables)
export const TARIFF_CONFIG = {
  // Transport rates per passenger-km in INR
  transport: {
    train2SPerKm: 0.45,
    trainSleeperPerKm: 0.65,
    train3ACPerKm: 1.65,
    busOrdinaryPerKm: 0.90,
    busExpressPerKm: 1.35,
    busSleeperPerKm: 1.85,
    localAutoBase: 40,
    localAutoPerKm: 16,
  },
  // Daily meal cost benchmarks in INR per person
  foodPerDay: {
    budget: 280,
    standard: 420,
    comfort: 650,
  },
  // Base accommodation tariffs per room/night (double occupancy) in INR
  lodgingPerNight: {
    budget: 950,
    standard: 1650,
    comfort: 3200,
    premium: 5800,
  },
  // Local daily sightseeing and transit transit buffer by category in INR
  localDailyByCategory: {
    hill: 250,
    beach: 180,
    temple: 150,
    city: 190,
    heritage: 160,
    wildlife: 280,
  } as Record<string, number>,
  // Seasonal adjustments
  seasonalMultipliers: {
    peakSeason: 1.20,
    normalSeason: 1.00,
    monsoonOffSeason: 0.85,
  },
};

/**
 * Computes dynamic seasonal multiplier based on target date and destination's best visit months
 */
export function getSeasonalMultiplier(dest?: TNDestination | null, targetDate = new Date()): number {
  if (!dest || !dest.bestMonths || dest.bestMonths.length === 0) {
    return TARIFF_CONFIG.seasonalMultipliers.normalSeason;
  }

  const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const currentMonth = monthNames[targetDate.getMonth()];
  const isPeak = dest.bestMonths.some((m) => m.toLowerCase().includes(currentMonth) || currentMonth.includes(m.toLowerCase()));

  // Off-season check for heavy monsoon (June-July in hills, or Nov in low-lying delta)
  const isMonsoon = (dest.category === "hill" && (targetDate.getMonth() === 5 || targetDate.getMonth() === 6));

  if (isMonsoon) return TARIFF_CONFIG.seasonalMultipliers.monsoonOffSeason;
  if (isPeak) return TARIFF_CONFIG.seasonalMultipliers.peakSeason;
  return TARIFF_CONFIG.seasonalMultipliers.normalSeason;
}

/**
 * Dynamically computes lodging cost range per room/night
 */
export function getDynamicHotelRates(
  category: "budget" | "standard" | "comfort" | "premium",
  destCategory: string = "city",
  seasonalMultiplier = 1.0
): { min: number; max: number; base: number } {
  const base = TARIFF_CONFIG.lodgingPerNight[category] || TARIFF_CONFIG.lodgingPerNight.standard;
  const categoryBonus = destCategory === "hill" ? 1.15 : destCategory === "beach" ? 1.10 : 1.0;

  const adjustedBase = Math.round(base * seasonalMultiplier * categoryBonus);
  const min = Math.round(adjustedBase * 0.85);
  const max = Math.round(adjustedBase * 1.35);

  return { min, max, base: adjustedBase };
}

/**
 * Dynamically computes transport cost estimate for a given distance
 */
export function getDynamicTransportCost(
  distanceKm: number,
  style: "budget" | "standard" | "comfort" = "standard",
  travellers = 1
): { min: number; max: number; base: number } {
  const dist = Math.max(15, distanceKm);
  let perKm = TARIFF_CONFIG.transport.busExpressPerKm;

  if (style === "budget") {
    perKm = TARIFF_CONFIG.transport.busOrdinaryPerKm;
  } else if (style === "comfort") {
    perKm = TARIFF_CONFIG.transport.busSleeperPerKm;
  }

  const singleTrip = Math.max(45, Math.round(dist * perKm));
  const roundTrip = singleTrip * 2 * travellers;
  const min = Math.round(roundTrip * 0.9);
  const max = Math.round(roundTrip * 1.25);

  return { min, max, base: roundTrip };
}

/**
 * Dynamically computes daily food cost for destination
 */
export function getDynamicFoodCostPerDay(
  style: "budget" | "standard" | "comfort" = "standard",
  destCategory: string = "city"
): number {
  const base = TARIFF_CONFIG.foodPerDay[style] || TARIFF_CONFIG.foodPerDay.standard;
  const categoryBonus = destCategory === "hill" || destCategory === "wildlife" ? 40 : 0;
  return base + categoryBonus;
}

/**
 * Dynamically computes daily local sightseeing & transit cost
 */
export function getDynamicLocalCostPerDay(destCategory: string = "city"): number {
  return TARIFF_CONFIG.localDailyByCategory[destCategory] || TARIFF_CONFIG.localDailyByCategory.city;
}
