import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useAppLock } from "@/context/AppLockContext";
import { useAuth } from "@/hooks/useAuth";
import { Delete, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

export const AppLockOverlay: React.FC = () => {
  const { isLocked, verifyPasscode, failedAttempts, resetAppLock } = useAppLock();
  const { user, authReady, explicitLogin, loginWithGoogle, logout } = useAuth();
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

  // Reset local state and restore body pointer events when overlay opens/closes
  useEffect(() => {
    if (!isLocked) {
      setPin("");
      isSubmittingRef.current = false;
      if (typeof document !== "undefined" && document.body) {
        document.body.style.pointerEvents = "";
      }
    }
    return () => {
      if (typeof document !== "undefined" && document.body) {
        document.body.style.pointerEvents = "";
      }
    };
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

  // Check if App Lock is enabled in local storage
  const isAppLockSaved = typeof window !== "undefined" && localStorage.getItem("sikkanam_applock_enabled") === "true";

  if (typeof window === "undefined") return null;

  // While Firebase Auth is loading (authReady is false), if lock is saved, render a solid dark Security Shield screen
  // so that NOT A SINGLE PIXEL of the home screen or private data is ever visible!
  if (!authReady && isAppLockSaved) {
    return createPortal(
      <div
        style={{ pointerEvents: "auto" }}
        className="fixed inset-0 z-[9999999] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-white select-none"
      >
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 grid place-items-center mb-4 shadow-xl shadow-orange-500/10">
          <Lock className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="font-display font-extrabold text-xl tracking-tight text-white mb-1">
          Securing Session...
        </h2>
        <p className="text-xs text-zinc-400 font-medium">
          Verifying security lock & credentials
        </p>
      </div>,
      document.body
    );
  }

  if (!authReady || !isLocked || !user || !explicitLogin) return null;

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

  return createPortal(
    <div
      style={{ pointerEvents: "auto" }}
      className="fixed inset-0 z-[9999999] bg-[#121413] text-white flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Sikkanam Logo Image */}
        <img
          src="/logo.png"
          alt="Sikkanam Logo"
          className="w-16 h-16 rounded-2xl shadow-lg shadow-orange-500/20 mb-6 object-cover"
        />

        {/* Header */}
        <h1 className="font-display font-bold text-2xl tracking-tight text-white mb-1">
          Welcome Back, Traveler 👋
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8 font-medium">
          Enter your 4-digit PIN to unlock Sikkanam
        </p>

        {/* PIN Indicators */}
        <div
          className={`flex items-center gap-4 mb-10 transition-transform ${shake ? "animate-shake" : ""
            }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${isFilled
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
              type="button"
              onClick={() => handleKeyPress(num)}
              className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-2xl font-bold text-white shadow-sm border border-zinc-700/40 touch-manipulation select-none cursor-pointer"
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
            key="0"
            type="button"
            onClick={() => handleKeyPress("0")}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-2xl font-bold text-white shadow-sm border border-zinc-700/40 touch-manipulation select-none cursor-pointer"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            key="delete"
            type="button"
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all duration-150 flex items-center justify-center text-white shadow-sm border border-zinc-700/40 touch-manipulation select-none cursor-pointer"
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
                type="button"
                onClick={() => setShowResetModal(true)}
                className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
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
              type="button"
              onClick={handleGoogleAuthReset}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-md mb-3 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 p-0.5 shadow-sm">
                    <GoogleIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 font-medium py-1 transition-colors cursor-pointer"
            >
              Cancel & Return to Lock Screen
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
