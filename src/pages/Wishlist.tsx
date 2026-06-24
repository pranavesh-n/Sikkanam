import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { tnDestinations } from "@/data/tnDestinations";
import DestinationCard from "@/components/DestinationsCard";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.wishlist || []);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto stroke-1" />
        <h2 className="font-display font-bold text-xl">Sign in to view Wishlist</h2>
        <p className="text-sm text-muted-foreground">
          You need to be signed in to view and save your wishlist destinations.
        </p>
        <Link
          to="/profile"
          className="inline-flex px-6 py-2 rounded-full gradient-saffron text-primary-foreground font-semibold text-sm shadow-card active:scale-[0.98] transition-transform"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  const wishlistedPlaces = tnDestinations.filter((dest) => wishlistIds.includes(dest.id));

  return (
    <div className="max-w-md md:max-w-6xl mx-auto px-4 md:px-6 pt-4 md:pt-8 pb-6">
      <div className="mb-6 text-left">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-primary fill-primary" /> Wishlist
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Your saved travel destinations in Tamil Nadu.
        </p>
      </div>

      {wishlistedPlaces.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link
            to="/explore"
            className="inline-flex px-5 py-2 rounded-full gradient-saffron text-primary-foreground font-semibold text-xs shadow-card active:scale-[0.98] transition-transform"
          >
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {wishlistedPlaces.map((d) => (
            <DestinationCard key={d.id} place={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
