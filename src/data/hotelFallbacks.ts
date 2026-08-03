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
  pudukkottai: [
    { name: "Chidambara Vilas", priceCategory: "comfort", rating: 4.5 },
    { name: "Hotel Pudukkottai Residency", priceCategory: "standard", rating: 4.1 },
  ],
  "gingee-fort": [
    { name: "Gingee Royal Residency", priceCategory: "budget", rating: 4.0 },
  ],
  padmanabhapuram: [
    { name: "Palace View Residency", priceCategory: "standard", rating: 4.2 },
  ],
  kanadukathan: [
    { name: "Visalam - CGH Earth Chettinad", priceCategory: "comfort", rating: 4.6 },
    { name: "Chettinad Heritage Home", priceCategory: "standard", rating: 4.2 },
  ],
  keezhadi: [
    { name: "Vaigai Heritage Lodge", priceCategory: "standard", rating: 4.0 },
  ],
  "thirumalai-nayakar-mahal": [
    { name: "Heritage Hotel Madurai", priceCategory: "comfort", rating: 4.4 },
  ],
};
