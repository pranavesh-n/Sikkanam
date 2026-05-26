import { useSearchParams } from "react-router-dom";
import SikkanamMap from "@/components/SikkanamMap";
import { tnDestinations } from "@/data/tnDestinations";

const Maps = () => {
  const [searchParams] = useSearchParams();

  const destinationId = searchParams.get("destination");

  const selectedDestination = tnDestinations.find(
    (d) => d.id === destinationId
  );

  return (
    <div className="w-full h-screen">
      <SikkanamMap destination={selectedDestination} />
    </div>
  );
};

export default Maps;