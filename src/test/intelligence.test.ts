import { describe, it, expect } from "vitest";
import { calculateTravelCostIntelligence, getBudgetReliability, type TripInput } from "../lib/tripPlanner";
import { type TNDestination, type Hotel } from "../data/tnDestinations";
import { getAttractionDetail } from "../data/activityDatabase";

describe("Travel Cost Intelligence Engine", () => {
  const mockInput: TripInput = {
    source: "chennai",
    destination: "ooty",
    days: 3,
    travellers: 2,
    style: "standard",
    budget: 5000,
    travellerType: "family"
  };

  const mockDestination: TNDestination = {
    id: "ooty",
    name: "Ooty",
    fullName: "Ooty (Udhagamandalam)",
    category: "hill",
    emoji: "🍵",
    district: "Nilgiris",
    description: "Queen of Hill Stations.",
    attractions: [
      "Ooty Lake 🚣",
      "Botanical Garden 🌸",
      "Doddabetta Peak 🏔️",
      "Pykara Lake 💧",
      "Rose Garden 🌹"
    ],
    nearestStation: "Mettupalayam",
    hasRailAccess: false,
    lat: 11.41,
    lng: 76.69,
    costIndex: 4,
    mobilityProfile: "high",
    activityProfile: { freeAttractions: 5, paidAttractions: 3, averageEntryFee: 40 },
    budgetReliability: 82
  };

  const mockRoute = [
    {
      from: "Chennai",
      to: "Ooty",
      mode: "bus" as const,
      distanceKm: 535,
      costPerPerson: 650,
      duration: "12h",
      routeIntel: {
        roadDistanceKm: 535,
        estimatedDurationMinutes: 720,
        routeSource: "OSRM" as const,
        routeStatus: "verified" as const
      }
    }
  ];

  const mockHotels: Hotel[] = [
    {
      name: "Ooty Lake View Hotel",
      rating: 4.2,
      distanceKm: 1.2,
      tier: "Standard",
      priceCategory: "standard"
    }
  ];

  it("calculates cost components correctly based on destination profiles", () => {
    const intelligence = calculateTravelCostIntelligence(
      mockInput,
      mockDestination,
      mockRoute,
      mockHotels
    );

    expect(intelligence).toBeDefined();
    expect(intelligence.intelligenceVersion).toBe("v4.3");
    expect(intelligence.minRequired).toBeGreaterThan(0);
    expect(intelligence.comfortBudget).toBeGreaterThan(intelligence.minRequired);
    expect(intelligence.expectedSpend).toBeDefined();
    expect(intelligence.emergencyBuffer).toBeDefined();
    expect(intelligence.expectedSpend % 500).toBe(0);
    expect(intelligence.emergencyBuffer % 500).toBe(0);
    expect(intelligence.recommendedCarry).toBe(intelligence.expectedSpend + intelligence.emergencyBuffer);

    // Food component verification without confidence
    expect(intelligence.components.food.min).toBeGreaterThan(0);
    expect(intelligence.components.food.confidence).toBeUndefined();

    // Local Mobility verification without confidence
    expect(intelligence.components.mobility.min).toBeGreaterThan(0);
    expect(intelligence.components.mobility.confidence).toBeUndefined();
  });

  it("calculates day trips (nights = 0) with hotel cost equal to 0", () => {
    const dayTripInput: TripInput = {
      ...mockInput,
      days: 1
    };

    const intelligence = calculateTravelCostIntelligence(
      dayTripInput,
      mockDestination,
      mockRoute,
      []
    );

    expect(intelligence.components.hotel.min).toBe(0);
    expect(intelligence.components.hotel.max).toBe(0);
    expect(intelligence.components.hotel.confidence).toBeUndefined();
  });

  // 1. Reliability derivation tests
  it("derives budget reliability dynamically based on evidence checklist", () => {
    const allAvailable = {
      roadRouteVerified: true,
      hotelInventoryAvailable: true,
      attractionDatabaseAvailable: true,
      foodProfileAvailable: true,
      destinationMetadataAvailable: true
    };
    expect(getBudgetReliability(allAvailable).reliability).toBe("Very High");

    const oneMissing = {
      ...allAvailable,
      roadRouteVerified: false
    };
    expect(getBudgetReliability(oneMissing).reliability).toBe("High");

    const twoMissing = {
      ...allAvailable,
      roadRouteVerified: false,
      hotelInventoryAvailable: false
    };
    expect(getBudgetReliability(twoMissing).reliability).toBe("Moderate");

    const threeMissing = {
      ...allAvailable,
      roadRouteVerified: false,
      hotelInventoryAvailable: false,
      attractionDatabaseAvailable: false
    };
    expect(getBudgetReliability(threeMissing).reliability).toBe("Low");
  });

  // 2. Attraction fallback tests
  it("falls back gracefully when querying non-existent attractions", () => {
    const fallbackAttraction = getAttractionDetail("Non Existent Attraction XYZ");
    expect(fallbackAttraction).toBeDefined();
    expect(fallbackAttraction.entryFeeAdult).toBe(0);
    expect(fallbackAttraction.entryFeeChild).toBe(0);
    expect(fallbackAttraction.parkingFee).toBe(0);
    expect(fallbackAttraction.cameraFee).toBe(0);
    expect(fallbackAttraction.verificationSource).toBe("Unknown");
    expect(fallbackAttraction.lastVerified).toBe("Not Available");
    expect(fallbackAttraction.databaseVersion).toBe("TN-Attractions-v1.0");
  });

  // 3. Database version tests
  it("ensures attraction detail returns correct databaseVersion", () => {
    const detail = getAttractionDetail("Ooty Botanical Garden");
    expect(detail.databaseVersion).toBe("TN-Attractions-v1.0");
  });

  // 4. Meal cost profile tests
  it("calculates meal cost profiles correctly from cost index defaults", () => {
    const intelligence = calculateTravelCostIntelligence(
      mockInput,
      mockDestination,
      mockRoute,
      mockHotels
    );
    const foodBreakdown = intelligence.components.food.foodBreakdown;
    expect(foodBreakdown).toBeDefined();
    expect(foodBreakdown?.breakfast).toBeDefined();
    expect(foodBreakdown?.lunch).toBeDefined();
    expect(foodBreakdown?.dinner).toBeDefined();
    expect(foodBreakdown?.snacks).toBeDefined();
    expect(foodBreakdown?.minPerDay).toBeGreaterThan(0);
  });

  // 5. Hotel pricing evidence tests
  it("returns hotel pricing evidence with estimated source and count", () => {
    const intelligence = calculateTravelCostIntelligence(
      mockInput,
      mockDestination,
      mockRoute,
      mockHotels
    );
    const hotelMarketIntel = intelligence.components.hotel.hotelMarketIntel;
    expect(hotelMarketIntel).toBeDefined();
    expect(hotelMarketIntel?.pricingEvidence.source).toBe("estimated");
    expect(hotelMarketIntel?.pricingEvidence.nearbyHotelsFound).toBe(1);
    expect(hotelMarketIntel?.pricingEvidence.reason).toBeDefined();
  });

  // 6. Route status tests
  it("contains verified route status", () => {
    const intelligence = calculateTravelCostIntelligence(
      mockInput,
      mockDestination,
      mockRoute,
      mockHotels
    );
    expect(intelligence.evidenceChecklist.roadRouteVerified).toBe(true);
  });
});
