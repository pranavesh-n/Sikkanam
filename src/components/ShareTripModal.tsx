import { useState } from "react";
import { type TripPlan } from "@/lib/tripPlanner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share2, Copy, Check, MessageSquare, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TripPlan | null;
}

function getTripShareUrl(plan: TripPlan): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://sikkanam.vercel.app";
  const { source, destination, days, travellers, budget, style } = plan.input;
  return `${origin}/plan?from=${encodeURIComponent(source)}&to=${encodeURIComponent(destination)}&days=${days}&pax=${travellers}&budget=${budget}&style=${style}`;
}

export function generateRichWhatsAppText(plan: TripPlan): string {
  if (!plan || !plan.destination) return "";

  const dest = plan.destination;
  const travellers = plan.input.travellers;
  const days = plan.input.days;
  const perPerson = plan.budget.perPerson.toLocaleString("en-IN");
  const estimatedTotal = plan.budget.estimatedTotal.toLocaleString("en-IN");

  const routeSummary = plan.route.length > 0
    ? plan.route.map(leg => `${leg.from} ➔ ${leg.to} (${leg.mode})`).join(" + ")
    : "Direct Trip";

  const topAttractions = dest.attractions.slice(0, 4).join(" • ");
  const shareUrl = getTripShareUrl(plan);

  const lines = [
    `🍊 *SIKKANAM TRIP PLAN* 🍊`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📍 *Destination:* ${dest.emoji} ${dest.name} (${dest.district || "Tamil Nadu"})`,
    `👥 *Travellers:* ${travellers} Pax | 📅 *Duration:* ${days} Days`,
    `💰 *Budget:* ₹${perPerson}/person (₹${estimatedTotal} Est. Total)`,
    ``,
    `🚌 *Route:* ${routeSummary}`,
    `🏛️ *Top Spots:* ${topAttractions}`,
    ``,
    `🗓️ *ITINERARY HIGHLIGHTS:*`,
    ...plan.itinerary.map(day => `  • ${day.title}: ${day.activities.slice(0, 2).join(", ")}`),
    ``,
    `👉 *View Full Interactive Trip Plan:*`,
    `${shareUrl}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `✨ *Travel Smart • Spend Sikkanam*`,
  ];

  return lines.join("\n");
}

export default function ShareTripModal({ isOpen, onClose, plan }: ShareTripModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!plan || !plan.destination) return null;

  const dest = plan.destination;
  const travellers = plan.input.travellers;
  const days = plan.input.days;
  const budgetCarry = plan.intelligence
    ? `₹${plan.intelligence.minRequired.toLocaleString("en-IN")} – ₹${plan.intelligence.recommendedCarry.toLocaleString("en-IN")}`
    : `₹${plan.budget.estimatedTotal.toLocaleString("en-IN")}`;

  const shareUrl = getTripShareUrl(plan);

  const handleWhatsAppShare = () => {
    const text = generateRichWhatsAppText(plan);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    toast.success("Opening WhatsApp...");
  };

  const handleNativeShare = async () => {
    const text = generateRichWhatsAppText(plan);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sikkanam Trip Plan: ${dest.name}`,
          text: text,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (e) {
        // User cancelled or share failed
      }
    } else {
      handleWhatsAppShare();
    }
  };

  const handleCopyText = () => {
    const text = generateRichWhatsAppText(plan);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success("Trip summary copied to clipboard!");
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success("Trip link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-md w-full p-5 rounded-3xl sm:rounded-3xl border border-border bg-card shadow-2xl overflow-hidden space-y-4">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-display font-extrabold flex items-center gap-2 text-foreground">
              <Share2 className="w-5 h-5 text-primary" /> Share Trip Plan
            </DialogTitle>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
              Sikkanam 🍊
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Share this travel itinerary with your travel buddies or WhatsApp groups!
          </DialogDescription>
        </DialogHeader>

        {/* Visual Trip Poster Preview Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300/60 dark:border-amber-900/50 rounded-2xl p-4 space-y-3.5 shadow-2xs relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

          {/* Header & Destination */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                <span>{dest.emoji}</span>
                <span>{dest.district || "Tamil Nadu"}</span>
              </div>
              <h3 className="font-display font-black text-xl text-foreground">
                {dest.name}
              </h3>
            </div>
            <div className="text-right shrink-0 bg-primary/15 dark:bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">EST. BUDGET</span>
              <span className="text-xs font-black text-primary">{budgetCarry}</span>
            </div>
          </div>

          {/* Details Bar */}
          <div className="grid grid-cols-3 gap-2 bg-card/80 dark:bg-slate-900/80 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-2 text-center text-xs font-bold text-foreground">
            <div className="flex flex-col items-center justify-center border-r border-border/40">
              <span className="text-[9px] font-extrabold uppercase text-muted-foreground">DAYS</span>
              <span>{days} Days</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-border/40">
              <span className="text-[9px] font-extrabold uppercase text-muted-foreground">TRAVELLERS</span>
              <span>{travellers} Pax</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-extrabold uppercase text-muted-foreground">STYLE</span>
              <span className="capitalize">{plan.input.style}</span>
            </div>
          </div>

          {/* Top Spots */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-900 dark:text-amber-200 tracking-wider block">
              TOP ATTRACTIONS:
            </span>
            <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
              {dest.attractions.slice(0, 4).join(" • ")}
            </p>
          </div>

          {/* Sikkanam Branding Footnote */}
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Created on Sikkanam AI
            </span>
            <span className="text-primary font-bold">sikkanam.vercel.app</span>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary 1-Click WhatsApp Share */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
          >
            <MessageSquare className="w-4 h-4 fill-white" /> Share to WhatsApp
          </button>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Native Share Sheet */}
            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-muted/60 hover:bg-accent border border-border/80 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-primary" /> More Apps
            </button>

            {/* Copy Markdown Text */}
            <button
              onClick={handleCopyText}
              className="py-2.5 px-3 rounded-xl bg-muted/60 hover:bg-accent border border-border/80 text-foreground font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-primary" /> Copy Details
                </>
              )}
            </button>
          </div>

          {/* Copy Direct Link */}
          <button
            onClick={handleCopyLink}
            className="w-full py-2 px-3 rounded-xl bg-card hover:bg-muted/40 border border-border/60 text-muted-foreground hover:text-foreground font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors truncate"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Link Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> Copy Direct Trip Link
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
