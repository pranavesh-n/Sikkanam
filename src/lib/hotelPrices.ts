/**
 * Hotel price ranges by category (INR).
 * Currently global — future versions may support per-destination overrides:
 *   HOTEL_RANGES_BY_DESTINATION["kodaikanal"].budget = { min: 1200, max: 2500 }
 */
export type HotelPriceCategory = "budget" | "standard" | "comfort" | "premium";

export type HotelPriceRange = { min: number; max: number };

export const HOTEL_RANGES: Record<HotelPriceCategory, HotelPriceRange> = {
  budget: {
    min: 800,
    max: 1500,
  },

  standard: {
    min: 1500,
    max: 3000,
  },

  comfort: {
    min: 3000,
    max: 5500,
  },

  premium: {
    min: 5500,
    max: 10000,
  },
};