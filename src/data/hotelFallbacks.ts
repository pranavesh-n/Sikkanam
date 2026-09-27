export type CuratedHotel = {
  name: string;
  priceCategory?: "budget" | "standard" | "comfort" | "premium";
  rating?: number;
  type?: string;
  amenities?: string[];
  pricePerNight?: number;
};

export const HOTEL_FALLBACKS: Record<string, CuratedHotel[]> = {
  ooty: [
    { name: "TTDC Hotel Tamil Nadu - Ooty", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Free Parking", "Restaurant", "Garden View"], pricePerNight: 1100 },
    { name: "Youth Hostel Ooty", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Dorm / Private Rooms", "WiFi"], pricePerNight: 650 },
    { name: "Savoy - Ooty", priceCategory: "premium", rating: 4.5, type: "premium", amenities: ["Heritage", "Fireplace", "Spa"], pricePerNight: 7500 },
    { name: "Fortune Resort Sullivan Court", priceCategory: "comfort", rating: 4.2, type: "comfort", amenities: ["Gym", "Bar", "Restaurant"], pricePerNight: 3800 },
  ],
  kodaikanal: [
    { name: "TTDC Hotel Tamil Nadu - Kodaikanal", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Lake Proximity", "Restaurant", "Hot Water"], pricePerNight: 1250 },
    { name: "Kodai Valley Budget Lodge", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Hot Water", "Parking"], pricePerNight: 850 },
    { name: "Kodai Resort Hotel", priceCategory: "comfort", rating: 4.2, type: "comfort", amenities: ["Cottages", "Lawns", "Bonfire"], pricePerNight: 3200 },
  ],
  yercaud: [
    { name: "TTDC Hotel Tamil Nadu - Yercaud", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Lake View", "Restaurant", "Parking"], pricePerNight: 1050 },
    { name: "Shevaroys Valley Lodge", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Hot Water", "24h Front Desk"], pricePerNight: 800 },
    { name: "Grand Palace Hotel & Spa", priceCategory: "comfort", rating: 4.3, type: "comfort", amenities: ["Spa", "Pool", "View Point"], pricePerNight: 3500 },
  ],
  madurai: [
    { name: "TTDC Hotel Tamil Nadu II (West Veli St)", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Walking Distance to Station", "AC / Non-AC"], pricePerNight: 950 },
    { name: "Hotel Supreme Madurai", priceCategory: "standard", rating: 4.1, type: "standard", amenities: ["Rooftop Restaurant", "Temple View"], pricePerNight: 1600 },
    { name: "Heritage Madurai", priceCategory: "premium", rating: 4.6, type: "premium", amenities: ["Heritage Pool", "Fine Dining"], pricePerNight: 6200 },
  ],
  rameswaram: [
    { name: "TTDC Hotel Tamil Nadu - Rameswaram", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Temple Proximity", "Agni Theertham Walk"], pricePerNight: 900 },
    { name: "Hotel Temple View Residency", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["AC Rooms", "Free Parking"], pricePerNight: 1100 },
    { name: "Daiwik Hotels Rameswaram", priceCategory: "comfort", rating: 4.3, type: "comfort", amenities: ["Pilgrim Activity Desk", "Vegetarian Dining"], pricePerNight: 3100 },
  ],
  kanyakumari: [
    { name: "TTDC Hotel Tamil Nadu - Kanyakumari", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Sunrise View", "Direct Beach Walk"], pricePerNight: 1150 },
    { name: "Cape Residency Lodge", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Near Ferry Wharf", "Hot Water"], pricePerNight: 850 },
    { name: "Sparsa Resort Kanyakumari", priceCategory: "comfort", rating: 4.4, type: "comfort", amenities: ["Sea View", "Pool", "Gardens"], pricePerNight: 4200 },
  ],
  thanjavur: [
    { name: "TTDC Hotel Tamil Nadu - Thanjavur", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Near Big Temple", "Garden Restaurant"], pricePerNight: 950 },
    { name: "Hotel Gnanam", priceCategory: "standard", rating: 4.2, type: "standard", amenities: ["Pure Veg Restaurant", "Central Location"], pricePerNight: 1750 },
    { name: "Svatma Heritage", priceCategory: "premium", rating: 4.7, type: "premium", amenities: ["Luxury Heritage", "Carnatic Culture", "Spa"], pricePerNight: 8500 },
  ],
  tiruvannamalai: [
    { name: "TTDC Hotel Tamil Nadu - Tiruvannamalai", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Girivalam Path Access", "Quiet Atmosphere"], pricePerNight: 900 },
    { name: "Arunachala Ramana Residency", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Near Ashram", "Clean Rooms"], pricePerNight: 850 },
    { name: "Sparsa Resort Tiruvannamalai", priceCategory: "comfort", rating: 4.5, type: "comfort", amenities: ["Eco-friendly", "Hill View", "Yoga"], pricePerNight: 3900 },
  ],
  chidambaram: [
    { name: "TTDC Hotel Tamil Nadu - Chidambaram", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Near Natarajar Temple", "AC & Non-AC"], pricePerNight: 850 },
    { name: "Hotel Saradharam", priceCategory: "standard", rating: 4.0, type: "standard", amenities: ["Opposite Bus Stand", "Restaurant"], pricePerNight: 1400 },
  ],
  valparai: [
    { name: "Green Hill Hotel Valparai", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Tea Estate View", "Hot Water"], pricePerNight: 1100 },
    { name: "Valparai Estate Homestay", priceCategory: "standard", rating: 4.2, type: "standard", amenities: ["Home Cooked Meals", "Plantation Walk"], pricePerNight: 1600 },
  ],
  courtallam: [
    { name: "TTDC Hotel Tamil Nadu - Courtallam", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Near Main Falls", "Restaurant"], pricePerNight: 900 },
    { name: "Saaral Resort", priceCategory: "comfort", rating: 4.1, type: "comfort", amenities: ["Spa", "Family Suites"], pricePerNight: 2800 },
  ],
  hogenakkal: [
    { name: "TTDC Hotel Tamil Nadu - Hogenakkal", priceCategory: "budget", rating: 3.8, type: "budget", amenities: ["Near Boating Ghat", "Waterfall Access"], pricePerNight: 950 },
  ],
  mahabalipuram: [
    { name: "TTDC Beach Resort - Mahabalipuram", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Private Beach Front", "Cottages"], pricePerNight: 1400 },
    { name: "Sea Breeze Hotel", priceCategory: "standard", rating: 4.1, type: "standard", amenities: ["Swimming Pool", "Beach Access"], pricePerNight: 2400 },
  ],
  chennai: [
    { name: "TTDC Hotel Tamil Nadu - Chennai Central", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Transit Hub", "AC & Non-AC"], pricePerNight: 1100 },
    { name: "Hotel Savera", priceCategory: "comfort", rating: 4.2, type: "comfort", amenities: ["Central City", "Multiple Restaurants"], pricePerNight: 3500 },
  ],
  coimbatore: [
    { name: "Hotel City Tower Coimbatore", priceCategory: "standard", rating: 4.1, type: "standard", amenities: ["Gandhipuram Bus Stand Access", "Pure Veg Dining"], pricePerNight: 1650 },
    { name: "Hotel Vydyash", priceCategory: "budget", rating: 3.9, type: "budget", amenities: ["Budget Transit Stay"], pricePerNight: 900 },
  ],
  pudukkottai: [
    { name: "Hotel Pudukkottai Residency", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Clean Rooms", "City Center"], pricePerNight: 1050 },
    { name: "Chidambara Vilas", priceCategory: "comfort", rating: 4.6, type: "comfort", amenities: ["Authentic Chettinad Mansion", "Traditional Dining"], pricePerNight: 5500 },
  ],
  "gingee-fort": [
    { name: "Gingee Royal Residency", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Fort View", "Clean Bathrooms"], pricePerNight: 950 },
  ],
  padmanabhapuram: [
    { name: "Palace View Residency", priceCategory: "budget", rating: 4.1, type: "budget", amenities: ["Near Wooden Palace", "Hot Water"], pricePerNight: 900 },
  ],
  kanadukathan: [
    { name: "Visalam - CGH Earth Chettinad", priceCategory: "premium", rating: 4.6, type: "premium", amenities: ["Heritage Experience", "Cooking Demos"], pricePerNight: 7200 },
    { name: "Chettinad Heritage Home", priceCategory: "budget", rating: 4.2, type: "budget", amenities: ["Homestay Experience", "Authentic Meals"], pricePerNight: 1400 },
  ],
  keezhadi: [
    { name: "Vaigai Heritage Lodge", priceCategory: "budget", rating: 4.0, type: "budget", amenities: ["Near Museum", "Rural Setting"], pricePerNight: 850 },
  ],
  "thirumalai-nayakar-mahal": [
    { name: "Heritage Hotel Madurai", priceCategory: "comfort", rating: 4.4, type: "comfort", amenities: ["Central Madurai"], pricePerNight: 3100 },
  ],
};
