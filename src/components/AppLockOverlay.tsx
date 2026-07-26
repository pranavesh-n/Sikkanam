import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppLock } from "@/context/AppLockContext";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/context/OnboardingContext";
import { Delete, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";

export const AppLockOverlay: React.FC = () => {
  const { isLocked, verifyPasscode, failedAttempts, resetAppLock } = useAppLock();
  const { user, loginWithGoogle, logout } = useAuth();
  const { isOnboardingActive } = useOnboarding();
  const [pin, setPin] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);

  const processPinEntry = useCallback(
    async (enteredPin: string) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        const success = await verifyPasscode(enteredPin);
        if (success) {
          toast.success("App unlocked");
          setPin("");
          isSubmittingRef.current = false;
        } else {
          setShake(true);
          toast.error("Incorrect PIN");
          setTimeout(() => {
            setShake(false);
            setPin("");
            isSubmittingRef.current = false;
          }, 350);
        }
      } catch (err) {
        setPin("");
        isSubmittingRef.current = false;
      }
    },
    [verifyPasscode]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      if (isSubmittingRef.current) return;
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const nextPin = prev + num;
        if (nextPin.length === 4) {
          processPinEntry(nextPin);
        }
        return nextPin;
      });
    },
    [processPinEntry]
  );

  const handleDelete = useCallback(() => {
    if (isSubmittingRef.current) return;
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Reset local state when overlay opens/closes
  useEffect(() => {
    if (!isLocked) {
      setPin("");
      isSubmittingRef.current = false;
    }
  }, [isLocked]);

  // Support PC physical keyboard typing & mobile touch
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResetModal || isSubmittingRef.current) return;
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLocked, showResetModal, handleKeyPress, handleDelete]);

  if (!isLocked || !user || isOnboardingActive) return null;

  const handleGoogleAuthReset = async () => {
    setIsAuthenticating(true);
    try {
      await logout();
      const success = await loginWithGoogle();
      if (success) {
        resetAppLock();
        setShowResetModal(false);
        setPin("");
        isSubmittingRef.current = false;
        toast.success("Identity verified! App Lock has been reset.");
      } else {
        toast.error("Google sign-in failed. Please try again.");
      }
    } catch (err) {
      toast.error("Authentication error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#121413] text-white flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Sikkanam Logo Image */}
        <img
          src="/logo.png"
          alt="Sikkanam Logo"
          className="w-16 h-16 rounded-2xl shadow-lg shadow-orange-500/20 mb-6 object-cover"
        />

        {/* Header */}
        <h1 className="font-display font-bold text-2xl tracking-tight text-white mb-1">
          Sikkanam is Locked
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8 font-medium">
          Enter your 4-digit PIN
        </p>

        {/* PIN Indicators */}
        <div
          className={`flex items-center gap-4 mb-10 transition-transform ${
            shake ? "animate-shake" : ""
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-primary scale-110 shadow-md shadow-orange-500/50"
                    : "border-2 border-zinc-600 bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-8">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-2xl font-bold text-white shadow-sm border border-zinc-700/40"
            >
              {num}
            </button>
          ))}

          {/* Empty Space / Lock Indicator */}
          <div className="w-full aspect-square flex items-center justify-center text-zinc-600">
            <Lock className="w-5 h-5 opacity-40" />
          </div>

          {/* Zero Button */}
          <button
            onClick={() => handleKeyPress("0")}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-2xl font-bold text-white shadow-sm border border-zinc-700/40"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all duration-150 flex items-center justify-center text-white shadow-sm border border-zinc-700/40"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Reset / Forgot PIN Footer */}
        <div className="text-center w-full">
          {failedAttempts >= 3 ? (
            <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <p className="text-xs text-rose-400 font-medium">
                Entered incorrectly 3 times
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <LogOut className="w-4 h-4 text-orange-400" />
                <span>Forgot PIN? Sign out & Login with Google to reset</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 font-medium">
              Forgot PIN? Enter incorrectly 3 times to reset
            </p>
          )}
        </div>
      </div>

      {/* Google Auth Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#181a19] border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col items-center">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Sikkanam"
              className="w-14 h-14 rounded-2xl shadow-md shadow-orange-500/20 mb-4 object-cover"
            />

            <h3 className="font-display font-bold text-xl text-white mb-1">
              Reset Sikkanam Passcode
            </h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-xs">
              To reset your 4-digit PIN, sign out of the app and log in with your Google account to verify your identity.
            </p>

            <button
              onClick={handleGoogleAuthReset}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-md mb-3 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowResetModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-medium py-1 transition-colors"
            >
              Cancel & Return to Lock Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
