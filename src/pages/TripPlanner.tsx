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
      }, 100);
    },
    []
  );

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