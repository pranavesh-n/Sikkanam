import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthPromptModal } from "./AuthPromptModal";

const WELCOME_AUTH_SESSION_KEY = "sikkanam_welcome_auth_dismissed";

export default function WelcomeAuthModal() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If user is already logged in, do not show welcome prompt
    if (user) {
      setIsOpen(false);
      return;
    }

    // Check if user dismissed in current browser session
    try {
      const dismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY);
      if (dismissed === "true") return;
    } catch (e) {}

    // Popup "Already a Sikkanam User?" modal on website entry
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(WELCOME_AUTH_SESSION_KEY, "true");
    } catch (e) {}
  };

  if (!isOpen || user || loading) return null;

  return (
    <AuthPromptModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Already a Sikkanam User?"
      subtitle="Sign in with Google to sync your saved itineraries, wishlists, and 4-digit passcode lock across your devices."
    />
  );
}
