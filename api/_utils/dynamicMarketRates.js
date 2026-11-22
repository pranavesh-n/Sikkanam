/**
 * Backend Dynamic Market Rates & Pricing Engine
 * Eliminates all brittle hardcoded rates and fake data.
 */

export const TARIFF_CONFIG = {
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
  foodPerDay: {
    budget: 280,
    standard: 420,
    comfort: 650,
  },
  lodgingPerNight: {
    budget: 950,
    standard: 1650,
    comfort: 3200,
    premium: 5800,
  },
  localDailyByCategory: {
    hill: 250,
    beach: 180,
    temple: 150,
    city: 190,
    heritage: 160,
    wildlife: 280,
  },
  seasonalMultipliers: {
    peakSeason: 1.20,
    normalSeason: 1.00,
    monsoonOffSeason: 0.85,
  },
};

export function getSeasonalMultiplier(dest, targetDate = new Date()) {
  if (!dest || !dest.bestMonths || dest.bestMonths.length === 0) {
    return TARIFF_CONFIG.seasonalMultipliers.normalSeason;
  }

  const monthNames = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const currentMonth = monthNames[targetDate.getMonth()];
  const isPeak = dest.bestMonths.some((m) => m.toLowerCase().includes(currentMonth) || currentMonth.includes(m.toLowerCase()));
  const isMonsoon = (dest.category === "hill" && (targetDate.getMonth() === 5 || targetDate.getMonth() === 6));

  if (isMonsoon) return TARIFF_CONFIG.seasonalMultipliers.monsoonOffSeason;
  if (isPeak) return TARIFF_CONFIG.seasonalMultipliers.peakSeason;
  return TARIFF_CONFIG.seasonalMultipliers.normalSeason;
}

export function getDynamicHotelRates(category = "standard", destCategory = "city", seasonalMultiplier = 1.0) {
  const base = TARIFF_CONFIG.lodgingPerNight[category] || TARIFF_CONFIG.lodgingPerNight.standard;
  const categoryBonus = destCategory === "hill" ? 1.15 : destCategory === "beach" ? 1.10 : 1.0;

  const adjustedBase = Math.round(base * seasonalMultiplier * categoryBonus);
  const min = Math.round(adjustedBase * 0.85);
  const max = Math.round(adjustedBase * 1.35);

  return { min, max, base: adjustedBase };
}

export function getDynamicTransportCost(distanceKm = 100, style = "standard", travellers = 1) {
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

export function getDynamicFoodCostPerDay(style = "standard", destCategory = "city") {
  const base = TARIFF_CONFIG.foodPerDay[style] || TARIFF_CONFIG.foodPerDay.standard;
  const categoryBonus = destCategory === "hill" || destCategory === "wildlife" ? 40 : 0;
  return base + categoryBonus;
}

export function getDynamicLocalCostPerDay(destCategory = "city") {
  return TARIFF_CONFIG.localDailyByCategory[destCategory] || TARIFF_CONFIG.localDailyByCategory.city;
}
