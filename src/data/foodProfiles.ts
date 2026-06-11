export type FoodCostIndex = "veryCheap" | "cheap" | "average" | "tourist" | "premium";

export interface MealProfile {
  min: number;
  max: number;
}

export interface FoodCategoryProfile {
  breakfast: MealProfile;
  lunch: MealProfile;
  dinner: MealProfile;
  snacks: MealProfile;
}

export interface FoodStyleProfile {
  budget: FoodCategoryProfile;
  standard: FoodCategoryProfile;
  comfort: FoodCategoryProfile;
}

export const FOOD_PROFILES: Record<FoodCostIndex, FoodStyleProfile> = {
  veryCheap: {
    budget: {
      breakfast: { min: 25, max: 40 },
      lunch: { min: 60, max: 90 },
      dinner: { min: 60, max: 90 },
      snacks: { min: 15, max: 30 }
    },
    standard: {
      breakfast: { min: 35, max: 60 },
      lunch: { min: 80, max: 130 },
      dinner: { min: 80, max: 130 },
      snacks: { min: 20, max: 40 }
    },
    comfort: {
      breakfast: { min: 60, max: 100 },
      lunch: { min: 150, max: 250 },
      dinner: { min: 150, max: 250 },
      snacks: { min: 40, max: 80 }
    }
  },
  cheap: {
    budget: {
      breakfast: { min: 30, max: 50 },
      lunch: { min: 70, max: 120 },
      dinner: { min: 70, max: 120 },
      snacks: { min: 20, max: 40 }
    },
    standard: {
      breakfast: { min: 40, max: 80 },
      lunch: { min: 100, max: 180 },
      dinner: { min: 100, max: 180 },
      snacks: { min: 30, max: 60 }
    },
    comfort: {
      breakfast: { min: 80, max: 150 },
      lunch: { min: 200, max: 350 },
      dinner: { min: 200, max: 350 },
      snacks: { min: 60, max: 120 }
    }
  },
  average: {
    budget: {
      breakfast: { min: 35, max: 60 },
      lunch: { min: 90, max: 140 },
      dinner: { min: 90, max: 140 },
      snacks: { min: 25, max: 45 }
    },
    standard: {
      breakfast: { min: 50, max: 90 },
      lunch: { min: 120, max: 200 },
      dinner: { min: 120, max: 200 },
      snacks: { min: 35, max: 70 }
    },
    comfort: {
      breakfast: { min: 100, max: 180 },
      lunch: { min: 250, max: 400 },
      dinner: { min: 250, max: 400 },
      snacks: { min: 70, max: 140 }
    }
  },
  tourist: {
    budget: {
      breakfast: { min: 40, max: 70 },
      lunch: { min: 100, max: 160 },
      dinner: { min: 100, max: 160 },
      snacks: { min: 30, max: 50 }
    },
    standard: {
      breakfast: { min: 60, max: 110 },
      lunch: { min: 150, max: 240 },
      dinner: { min: 150, max: 240 },
      snacks: { min: 40, max: 80 }
    },
    comfort: {
      breakfast: { min: 120, max: 220 },
      lunch: { min: 300, max: 500 },
      dinner: { min: 300, max: 500 },
      snacks: { min: 90, max: 180 }
    }
  },
  premium: {
    budget: {
      breakfast: { min: 50, max: 80 },
      lunch: { min: 120, max: 200 },
      dinner: { min: 120, max: 200 },
      snacks: { min: 40, max: 60 }
    },
    standard: {
      breakfast: { min: 75, max: 130 },
      lunch: { min: 180, max: 300 },
      dinner: { min: 180, max: 300 },
      snacks: { min: 50, max: 100 }
    },
    comfort: {
      breakfast: { min: 150, max: 280 },
      lunch: { min: 400, max: 650 },
      dinner: { min: 400, max: 650 },
      snacks: { min: 100, max: 220 }
    }
  }
};

export function getFoodCostIndex(costIndex?: number): FoodCostIndex {
  if (!costIndex) return "average";
  if (costIndex <= 1) return "veryCheap";
  if (costIndex === 2) return "cheap";
  if (costIndex === 3) return "average";
  if (costIndex === 4) return "tourist";
  return "premium";
}
