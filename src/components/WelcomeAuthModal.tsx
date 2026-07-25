import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthPromptModal } from "./AuthPromptModal";

const WELCOME_AUTH_SESSION_KEY = "sikkanam_welcome_auth_dismissed";
const VERSION_KEY = "sikkanam-version";
const CURRENT_VERSION = "2.4";

export default function WelcomeAuthModal() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      setIsOpen(false);
      return;
    }

    try {
      const dismissed = sessionStorage.getItem(WELCOME_AUTH_SESSION_KEY);
      if (dismissed === "true") return;
    } catch (e) {}

    // Wait until WhatsNewModal has closed (or was previously seen)
    const interval = setInterval(() => {
      try {
        const seenVersion = localStorage.getItem(VERSION_KEY);
        if (seenVersion === CURRENT_VERSION) {
          setIsOpen(true);
          clearInterval(interval);
        }
      } catch (e) {
        setIsOpen(true);
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
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
