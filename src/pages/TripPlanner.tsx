import { useRef, useState, useCallback } from "react";
import TripPlannerForm from "@/components/TripPlannerForm";
import TripResults from "@/components/TripResults";

import {
  generateTripPlan,
  type TripInput,
  type TripPlan,
} from "@/lib/tripPlanner";

const TripPlanner = () => {
  const resultsRef = useRef<HTMLDivElement>(null);

  const [tripPlan, setTripPlan] =
    useState<TripPlan | null>(null);

  const handleGenerate = useCallback(
    async (input: TripInput) => {
      const plan = await generateTripPlan(input);

      setTripPlan(plan);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    },
    []
  );

  return (
    <div className="max-w-md md:max-w-4xl mx-auto md:px-6 md:pt-6">
      <TripPlannerForm
        onGenerate={handleGenerate}
      />

      {tripPlan && (
        <TripResults
          ref={resultsRef}
          plan={tripPlan}
        />
      )}
    </div>
  );
};

export default TripPlanner;