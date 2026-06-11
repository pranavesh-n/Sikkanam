export interface CategoryPricingRule {
  transport: [number, number];
  hotelBudget: [number, number];
  hotelStandard: [number, number];
  hotelPremium: [number, number];
  food: [number, number];
  local: [number, number];
}

export const CATEGORY_PRICING: Record<string, CategoryPricingRule> = {
  hill: {
    transport: [700, 1200],
    hotelBudget: [1000, 2000],
    hotelStandard: [2000, 4000],
    hotelPremium: [4000, 8000],
    food: [500, 1000],
    local: [300, 800]
  },

  beach: {
    transport: [600, 1200],
    hotelBudget: [1200, 2500],
    hotelStandard: [2500, 4500],
    hotelPremium: [4500, 9000],
    food: [500, 1200],
    local: [400, 1000]
  },

  temple: {
    transport: [500, 1000],
    hotelBudget: [800, 1500],
    hotelStandard: [1500, 3000],
    hotelPremium: [3000, 6000],
    food: [400, 800],
    local: [200, 600]
  },

  city: {
    transport: [700, 1500],
    hotelBudget: [1200, 2500],
    hotelStandard: [2500, 5000],
    hotelPremium: [5000, 10000],
    food: [600, 1500],
    local: [400, 1200]
  },

  heritage: {
    transport: [600, 1200],
    hotelBudget: [1000, 2000],
    hotelStandard: [2000, 3500],
    hotelPremium: [3500, 7000],
    food: [500, 1000],
    local: [300, 700]
  },

  wildlife: {
    transport: [1000, 2000],
    hotelBudget: [1500, 3000],
    hotelStandard: [3000, 6000],
    hotelPremium: [6000, 12000],
    food: [600, 1200],
    local: [500, 1500]
  }
};