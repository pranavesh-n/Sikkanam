import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import UpdateChecker from "./components/UpdateChecker";
import Maps from "./pages/Maps";  
import { useEffect, useState } from "react";

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
const [showUpdatePopup, setShowUpdatePopup] = useState(false);

useEffect(() => {
  const currentVersion = "v1.0";

  const seenVersion = localStorage.getItem("sikkanam-version");

  if (seenVersion !== currentVersion) {
    setShowUpdatePopup(true);
  }
}, []);
return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <UpdateChecker />
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
    {showUpdatePopup && (
  <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
    <div className="bg-card rounded-2xl p-6 max-w-md w-full shadow-xl">

      <h2 className="text-2xl font-bold mb-4">
        🎉 Welcome to Sikkanam
      </h2>

      <div className="space-y-2 mb-6">
        <p>✅ Railway Journey Assistant</p>
        <p>✅ Better Hotel Recommendations</p>
        <p>✅ Improved Route Planning</p>
        <p>✅ Maps Integration</p>
        <p>✅ WhatsApp Sharing</p>
      </div>

      <button
        onClick={() => {
          localStorage.setItem(
            "sikkanam-version",
            "v1.0"
          );

          window.location.reload();
        }}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3"
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
