import { Link } from "react-router-dom";
import { TNDestination } from "@/data/tnDestinations";

interface Props {
  place: TNDestination;
}

export default function DestinationCard({ place }: Props) {
  return (
    <Link
      to={`/destination/${place.id}`}
      className="bg-card rounded-2xl border border-border p-3.5 active:scale-95 transition-transform shadow-card"
    >
      <span className="text-3xl block">
        {place.emoji}
      </span>

      <p className="font-display font-bold text-sm mt-2 truncate">
        {place.name}
      </p>

      <p className="text-[11px] text-muted-foreground truncate">
        {place.district}
      </p>

      <p className="text-[10px] text-primary mt-1.5 font-medium">
        {place.attractions.length} spots →
      </p>
    </Link>
  );
}