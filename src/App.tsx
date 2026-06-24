import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/next"
import Maps from "./pages/Maps";  
import WhatsNewModal from "./components/WhatsNewModal";

const Explore = lazy(() => import("./pages/Explore"));
const DestinationDetail = lazy(() => import("./pages/DestinationDetail"));
const AIPlanner = lazy(() => import("./pages/AIPlanner"));
const Booking = lazy(() => import("./pages/Booking"));
const Profile = lazy(() => import("./pages/Profile"));
const TripPlanner = lazy(() => import("./pages/TripPlanner"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const SavedTrips = lazy(() => import("./pages/SavedTrips"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WhatsNewModal />
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
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/saved-trips" element={<SavedTrips />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
