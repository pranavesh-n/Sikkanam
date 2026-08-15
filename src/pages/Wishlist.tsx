import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { tnDestinations } from "@/data/tnDestinations";
import DestinationCard from "@/components/DestinationsCard";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { Heart } from "lucide-react";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const Wishlist = () => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
    const handleWishlistUpdate = () => {
      if (user) fetchWishlist();
    };
    window.addEventListener("sikkanam:wishlist_updated", handleWishlistUpdate);
    return () => window.removeEventListener("sikkanam:wishlist_updated", handleWishlistUpdate);
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
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full gradient-saffron text-white font-bold text-sm shadow-card active:scale-[0.98] transition-transform"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-0.5 shadow-sm">
            <GoogleIcon className="w-3.5 h-3.5" />
          </div>
          <span>Sign in with Google</span>
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
