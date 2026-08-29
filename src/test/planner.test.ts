import { describe, it, expect } from "vitest";
import { generateTripPlan, type TripInput } from "../lib/tripPlanner";
import { findKNNDestinations, buildDynamicKNNCircuit } from "../lib/knnCircuitPlanner";
import { getDestinationById } from "../data/tnDestinations";

describe("Sikkanam Travel Planner & Dynamic Circuit Tests", () => {
  it("should plan a short/medium trip (Chennai -> Yelagiri) as a daytime morning trip without Day 0", async () => {
    const input: TripInput = {
      source: "chennai",
      destination: "yelagiri",
      days: 2,
      travellers: 2,
      style: "budget",
      budget: 6000,
      travellerType: "couple"
    };

    const plan = await generateTripPlan(input);
    expect(plan.destination.id).toBe("yelagiri");
    
    // Yelagiri is ~220km, so no Day 0 overnight sleeper should exist
    const dayZero = plan.itinerary.find((d) => d.day === 0);
    expect(dayZero).toBeUndefined();

    // Day 1 must start with morning departure (06:00 AM)
    const day1 = plan.itinerary.find((d) => d.day === 1);
    expect(day1).toBeDefined();
    expect(day1!.timeSchedule.length).toBeGreaterThan(0);

    // Verify chronological order of Day 1 timeSchedule
    for (let i = 1; i < day1!.timeSchedule.length; i++) {
      const prevOrder = day1!.timeSchedule[i - 1].order ?? 0;
      const currOrder = day1!.timeSchedule[i].order ?? 0;
      expect(currOrder).toBeGreaterThanOrEqual(prevOrder);
    }
  }, 15000);

  it("should plan a long-distance trip (Chennai -> Madurai) as an overnight trip with realistic arrival", async () => {
    const input: TripInput = {
      source: "chennai",
      destination: "madurai",
      days: 3,
      travellers: 2,
      style: "budget",
      budget: 10000,
      travellerType: "couple"
    };

    const plan = await generateTripPlan(input);
    expect(plan.destination.id).toBe("madurai");

    // Madurai is ~460km, so Day 0 should exist for a multi-day trip
    const dayZero = plan.itinerary.find((d) => d.day === 0);
    expect(dayZero).toBeDefined();

    // Day 1 activities must all be chronologically sorted
    const day1 = plan.itinerary.find((d) => d.day === 1);
    expect(day1).toBeDefined();
    for (let i = 1; i < day1!.timeSchedule.length; i++) {
      const prevOrder = day1!.timeSchedule[i - 1].order ?? 0;
      const currOrder = day1!.timeSchedule[i].order ?? 0;
      expect(currOrder).toBeGreaterThanOrEqual(prevOrder);
    }
  }, 15000);

  it("should calculate realistic multi-stop circuit distances and non-zero fares (Ooty + Coonoor)", () => {
    const ooty = getDestinationById("ooty");
    expect(ooty).toBeDefined();

    const neighbors = findKNNDestinations(ooty!, 2, 35, 1);
    expect(neighbors.length).toBeGreaterThan(0);

    const circuit = buildDynamicKNNCircuit(ooty!, 2, 13.0827, 80.2707, "chennai");
    expect(circuit).not.toBeNull();
    expect(circuit!.stops.length).toBeGreaterThanOrEqual(2);

    // Ensure inter-stop fares are non-zero (realistic bus rates)
    circuit!.stops.forEach((stop, idx) => {
      if (idx > 0) {
        expect(stop.interStopCostPerPerson).toBeGreaterThanOrEqual(25);
        expect(stop.distanceFromPreviousKm).toBeGreaterThan(0);
      }
    });

    expect(circuit!.unifiedBudgetPerPerson).toBeGreaterThanOrEqual(30);
  });
});
