import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import Maps from "./pages/Maps";  

const Explore = lazy(() => import("./pages/Explore"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const AIPlanner = lazy(() => import("./pages/AIPlanner"));
const Booking = lazy(() => import("./pages/Booking"));
const Profile = lazy(() => import("./pages/Profile"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem("sikkanam-welcome-seen");
    if (!seenVersion) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("sikkanam-welcome-seen", "true");
    setShowWelcomeModal(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShell>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/maps" element={<Maps />} />
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/destination/:id" element={<DestinationDetail />} />
                <Route path="/ai" element={<AIPlanner />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plan" element={<TripPlanner />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppShell>
        </BrowserRouter>
      </TooltipProvider>

      {/* Welcome Modal Popup */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-[2rem] p-6 md:p-8 max-w-sm w-full shadow-elevated border border-border animate-in zoom-in duration-200 flex flex-col">
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-6 flex items-center gap-2">
              🎉 Welcome to Sikkanam
            </h2>

            <div className="space-y-4 text-foreground flex-1">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✅</span>
                <span className="text-sm md:text-base font-medium">Railway Journey Assistant</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✅</span>
                <span className="text-sm md:text-base font-medium">Better Hotel Recommendations</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✅</span>
                <span className="text-sm md:text-base font-medium">Improved Route Planning</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✅</span>
                <span className="text-sm md:text-base font-medium">Maps Integration</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">✅</span>
                <span className="text-sm md:text-base font-medium">WhatsApp Sharing</span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-8 py-3.5 rounded-[1.25rem] gradient-saffron text-white font-semibold text-sm md:text-base shadow-card active:scale-[0.98] transition-transform hover:opacity-95"
            >
              🚀 Refresh & Start Exploring
            </button>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
};

export default App;
