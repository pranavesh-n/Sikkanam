import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { X, Lock, ShieldCheck, Bookmark, Heart, LogIn } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title = "Already a Sikkanam User or New User?",
  subtitle = "Sign in or sign up with Google to sync your saved trips, wishlists, and passcode lock across your devices.",
}) => {
  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSignIn = async () => {
    const success = await loginWithGoogle();
    if (success) {
      toast.success("Successfully signed in!");
      onClose();
    } else {
      toast.error("Google sign in failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99995] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border rounded-3xl max-w-sm w-full p-6 flex flex-col items-center relative shadow-2xl animate-in zoom-in-95 duration-150 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full bg-muted/60 hover:bg-muted transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sikkanam Logo Image */}
        <div className="w-14 h-14 rounded-2xl gradient-saffron grid place-items-center shadow-lg shadow-orange-500/20 mb-4 overflow-hidden">
          <img
            src="/logo.png"
            alt="Sikkanam Logo"
            className="w-10 h-10 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Title & Subtitle */}
        <h3 className="font-display font-extrabold text-xl text-foreground mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mb-5 px-2 leading-relaxed">
          {subtitle}
        </p>

        {/* Features Unlocked List */}
        <div className="w-full space-y-2.5 text-left bg-muted/40 p-3.5 rounded-2xl border border-border/50 mb-6">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
            <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 grid place-items-center flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
            <span>Cloud Firestore Real-Time Sync Across Devices</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary grid place-items-center flex-shrink-0">
              <Bookmark className="w-3.5 h-3.5" />
            </span>
            <span>Save AI Itineraries & Detailed Cost Plans</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
            <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 grid place-items-center flex-shrink-0">
              <Heart className="w-3.5 h-3.5" />
            </span>
            <span>Bookmark Handpicked Wishlist Destinations</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center flex-shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </span>
            <span>4-Digit App Passcode Security Lock</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={handleSignIn}
            className="w-full py-3.5 px-4 rounded-xl gradient-saffron text-white font-bold text-sm shadow-card active:scale-[0.98] transition-transform flex items-center justify-center gap-2.5"
          >
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-0.5 shadow-sm">
              <GoogleIcon className="w-3.5 h-3.5" />
            </div>
            <span>Sign in / Sign up with Google</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Continue as Guest (Explore Only)
          </button>
        </div>
      </div>
    </div>
  );
};
