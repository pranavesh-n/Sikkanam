import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { tnDestinations } from "@/data/tnDestinations";
import DestinationCard from "@/components/DestinationsCard";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { Heart } from "lucide-react";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
        <div className="w-16 h-16 rounded-3xl gradient-saffron mx-auto grid place-items-center shadow-lg shadow-orange-500/20 text-white">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-foreground">Already a Sikkanam User?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sign in with Google to view your handpicked wishlist destinations and sync them across all your devices.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-saffron text-white font-bold text-sm shadow-card active:scale-[0.98] transition-transform"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.386-2.876-6.386-6.386s2.876-6.386 6.386-6.386c1.697 0 3.2.664 4.343 1.74l3.124-3.124C19.346 2.23 16.03 1 12.24 1 5.766 1 .5 6.266.5 12.74S5.766 24.48 12.24 24.48c6.549 0 11.59-4.603 11.59-11.59 0-.765-.082-1.5-.23-2.22H12.24z" />
          </svg>
          Sign in with Google
        </button>

        <AuthPromptModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
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
