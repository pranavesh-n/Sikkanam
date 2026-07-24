import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAppLock } from "@/context/AppLockContext";
import { Delete, X } from "lucide-react";
import { toast } from "sonner";

interface PasscodeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasscodeSetupModal: React.FC<PasscodeSetupModalProps> = ({ isOpen, onClose }) => {
  const { setupPasscode } = useAppLock();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState<string>("");
  const [firstPin, setFirstPin] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);

  const isSubmittingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("create");
      setPin("");
      setFirstPin("");
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  const processStep = useCallback(
    (enteredPin: string) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      if (step === "create") {
        setFirstPin(enteredPin);
        setStep("confirm");
        setPin("");
        isSubmittingRef.current = false;
      } else if (step === "confirm") {
        if (enteredPin === firstPin) {
          setupPasscode(enteredPin);
          onClose();
          isSubmittingRef.current = false;
        } else {
          setShake(true);
          toast.error("PINs do not match. Try again.");
          setTimeout(() => {
            setShake(false);
            setStep("create");
            setPin("");
            setFirstPin("");
            isSubmittingRef.current = false;
          }, 350);
        }
      }
    },
    [step, firstPin, setupPasscode, onClose]
  );

  const handleKeyPress = useCallback(
    (num: string) => {
      if (isSubmittingRef.current) return;
      setPin((prev) => {
        if (prev.length >= 4) return prev;
        const nextPin = prev + num;
        if (nextPin.length === 4) {
          processStep(nextPin);
        }
        return nextPin;
      });
    },
    [processStep]
  );

  const handleDelete = useCallback(() => {
    if (isSubmittingRef.current) return;
    setPin((prev) => prev.slice(0, -1));
  }, []);

  // Support PC physical keyboard typing & mobile touch
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmittingRef.current) return;
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
  }, [isOpen, handleKeyPress, handleDelete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99990] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#161817] text-white border border-zinc-800 rounded-3xl max-w-sm w-full p-6 flex flex-col items-center relative shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sikkanam Logo Image */}
        <img
          src="/logo.png"
          alt="Sikkanam Logo"
          className="w-14 h-14 rounded-2xl shadow-md shadow-orange-500/20 mb-4 object-cover"
        />

        {/* Title */}
        <h2 className="font-display font-bold text-xl text-white mb-1">
          {step === "create" ? "Set App Lock PIN" : "Confirm App Lock PIN"}
        </h2>
        <p className="text-xs text-zinc-400 mb-6 font-medium text-center">
          {step === "create"
            ? "Enter a 4-digit PIN to protect your app"
            : "Re-enter your 4-digit PIN to confirm"}
        </p>

        {/* PIN Indicators */}
        <div
          className={`flex items-center gap-4 mb-8 transition-transform ${
            shake ? "animate-shake" : ""
          }`}
        >
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? "bg-primary scale-110 shadow-md shadow-orange-500/50"
                    : "border-2 border-zinc-600 bg-transparent"
                }`}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-xl font-bold text-white border border-zinc-700/40"
            >
              {num}
            </button>
          ))}

          <div className="w-full aspect-square" />

          <button
            onClick={() => handleKeyPress("0")}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 transition-all duration-150 flex items-center justify-center text-xl font-bold text-white border border-zinc-700/40"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="w-full aspect-square rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/80 active:scale-95 disabled:opacity-30 disabled:active:scale-100 transition-all duration-150 flex items-center justify-center text-white border border-zinc-700/40"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
