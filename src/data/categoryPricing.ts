import { TARIFF_CONFIG, getDynamicHotelRates } from "./marketRates";

export interface CategoryPricingRule {
  transport: [number, number];
  hotelBudget: [number, number];
  hotelStandard: [number, number];
  hotelPremium: [number, number];
  food: [number, number];
  local: [number, number];
}

/**
 * Computes category pricing rules dynamically based on current market rates and multipliers.
 */
export function createCategoryPricingRule(category: string, seasonalMultiplier = 1.0): CategoryPricingRule {
  const budget = getDynamicHotelRates("budget", category, seasonalMultiplier);
  const standard = getDynamicHotelRates("standard", category, seasonalMultiplier);
  const premium = getDynamicHotelRates("comfort", category, seasonalMultiplier);

  const localDaily = TARIFF_CONFIG.localDailyByCategory[category] || TARIFF_CONFIG.localDailyByCategory.city;
  const foodBase = TARIFF_CONFIG.foodPerDay.standard;

  return {
    transport: [
      category === "hill" || category === "wildlife" ? 800 : 500,
      category === "hill" || category === "wildlife" ? 1600 : 1200,
    ],
    hotelBudget: [budget.min, budget.max],
    hotelStandard: [standard.min, standard.max],
    hotelPremium: [premium.min, premium.max],
    food: [Math.round(foodBase * 0.9), Math.round(foodBase * 1.8)],
    local: [Math.round(localDaily * 0.9), Math.round(localDaily * 2.2)],
  };
}

export const CATEGORY_PRICING: Record<string, CategoryPricingRule> = {
  hill: createCategoryPricingRule("hill"),
  beach: createCategoryPricingRule("beach"),
  temple: createCategoryPricingRule("temple"),
  city: createCategoryPricingRule("city"),
  heritage: createCategoryPricingRule("heritage"),
  wildlife: createCategoryPricingRule("wildlife"),
};
