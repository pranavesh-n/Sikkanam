import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/context/OnboardingContext";
import { AuthPromptModal } from "./AuthPromptModal";

export default function WelcomeAuthModal() {
  const { user, loading } = useAuth();
  const { step, dismissWelcomeAuth } = useOnboarding();

  if (loading || user || step !== "WELCOME_AUTH") return null;

  return (
    <AuthPromptModal
      isOpen={true}
      onClose={dismissWelcomeAuth}
      title="Already a Sikkanam User or New User?"
      subtitle="Sign in or sign up with Google to sync your saved itineraries, wishlists, and 4-digit passcode security across all your devices."
    />
  );
}
