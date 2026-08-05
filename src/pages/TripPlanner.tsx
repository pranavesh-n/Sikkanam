import { useRef, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TripPlannerForm from "@/components/TripPlannerForm";
import TripResults from "@/components/TripResults";

import {
  generateTripPlan,
  type TripInput,
  type TripPlan,
  type TravelStyle,
  type TravellerType,
} from "@/lib/tripPlanner";

const TripPlanner = () => {
  const [searchParams] = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [tripInput, setTripInput] = useState<TripInput | null>(null);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);

  const handleGenerate = useCallback(
    async (input: TripInput) => {
      setTripInput(input);
      const plan = await generateTripPlan(input);

      setTripPlan(plan);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 150);
    },
    []
  );

  // Auto-generate plan if URL query parameters (from, to) are provided
  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const days = parseInt(searchParams.get("days") || "2", 10);
    const pax = parseInt(searchParams.get("pax") || "2", 10);
    const budget = parseInt(searchParams.get("budget") || "5000", 10);
    const style = (searchParams.get("style") as TravelStyle) || "standard";
    const travellerType = (searchParams.get("travellerType") as TravellerType) || "family";

    if (from && to) {
      const input: TripInput = {
        source: from,
        destination: to,
        days: isNaN(days) ? 2 : days,
        travellers: isNaN(pax) ? 2 : pax,
        budget: isNaN(budget) ? 5000 : budget,
        style,
        travellerType,
      };
      handleGenerate(input);
    }
  }, [searchParams, handleGenerate]);

  const handleSelectDestination = useCallback(
    async (destId: string) => {
      if (!tripInput) return;
      const nextInput = { ...tripInput, destination: destId };
      setTripInput(nextInput);
      const plan = await generateTripPlan(nextInput);
      setTripPlan(plan);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    },
    [tripInput]
  );

  return (
    <div className="max-w-md md:max-w-4xl mx-auto md:px-6 md:pt-6">
      <TripPlannerForm
        onGenerate={handleGenerate}
        initialInput={tripInput}
      />

      {tripPlan && (
        <TripResults
          ref={resultsRef}
          plan={tripPlan}
          onSelectDestination={handleSelectDestination}
        />
      )}
    </div>
  );
};

export default TripPlanner;