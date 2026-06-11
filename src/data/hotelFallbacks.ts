export type CuratedHotel = {
  name: string;
  priceCategory?: "budget" | "standard" | "comfort" | "premium";
  rating?: number;
  type?: string;
  amenities?: string[];
};

export const HOTEL_FALLBACKS: Record<string, CuratedHotel[]> = {
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
