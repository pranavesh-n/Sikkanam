import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TripResults from "@/components/TripResults";
import { Bookmark, Trash2, Edit2, ChevronLeft, Calendar, Check, X } from "lucide-react";
import { toast } from "sonner";

interface SavedTripType {
  _id: string;
  name: string;
  destination: string;
  duration: number;
  style: string;
  budget: string;
  itinerary: any;
  createdAt: string;
}

const SavedTrips = () => {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<SavedTripType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<SavedTripType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/trips?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        toast.success("Trip renamed successfully");
        setTrips(trips.map(t => t._id === id ? { ...t, name: editName } : t));
        if (selectedTrip?._id === id) {
          setSelectedTrip({ ...selectedTrip, name: editName });
        }
        setEditingId(null);
      } else {
        toast.error("Failed to rename trip");
      }
    } catch (error) {
      toast.error("Error renaming trip");
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved trip?")) return;
    try {
      const res = await fetch(`/api/trips?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Trip deleted successfully");
        setTrips(trips.filter(t => t._id !== id));
        if (selectedTrip?._id === id) {
          setSelectedTrip(null);
        }
      } else {
        toast.error("Failed to delete trip");
      }
    } catch (error) {
      toast.error("Error deleting trip");
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <Bookmark className="w-16 h-16 text-muted-foreground mx-auto stroke-1" />
        <h2 className="font-display font-bold text-xl">Sign in to view Saved Trips</h2>
        <p className="text-sm text-muted-foreground">
          You need to be signed in to view and save your custom travel itineraries.
        </p>
        <Link
          to="/profile"
          className="inline-flex px-6 py-2 rounded-full gradient-saffron text-primary-foreground font-semibold text-sm shadow-card active:scale-[0.98] transition-transform"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  if (selectedTrip) {
    return (
      <div className="max-w-md md:max-w-4xl mx-auto px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to list
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeleteTrip(selectedTrip._id)}
              className="p-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
              title="Delete Trip"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Title Panel */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {editingId === selectedTrip._id ? (
            <div className="flex items-center gap-2 w-full">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 max-w-sm bg-background border border-border rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Trip name"
              />
              <button
                onClick={() => handleUpdateName(selectedTrip._id)}
                className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-2 rounded-xl bg-muted text-foreground hover:bg-muted/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground text-left">
                  {selectedTrip.name}
                </h2>
                <p className="text-xs text-muted-foreground text-left mt-0.5">
                  Saved on {new Date(selectedTrip.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingId(selectedTrip._id);
                  setEditName(selectedTrip.name);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                <Edit2 className="w-3.5 h-3.5" /> Rename
              </button>
            </div>
          )}
        </div>

        <TripResults plan={selectedTrip.itinerary} />
      </div>
    );
  }

  return (
    <div className="max-w-md md:max-w-4xl mx-auto px-4 pt-4 md:pt-8 pb-6">
      <div className="mb-6 text-left">
        <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
          <Bookmark className="w-6 h-6 text-primary fill-primary" strokeWidth={1} /> Saved Trips
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Your saved travel plans and AI generated itineraries.
        </p>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card space-y-4">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">You haven't saved any trips yet.</p>
          <Link
            to="/plan"
            className="inline-flex px-5 py-2 rounded-full gradient-saffron text-primary-foreground font-semibold text-xs shadow-card active:scale-[0.98] transition-transform"
          >
            Plan a Trip
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5">
          {trips.map((t) => (
            <div
              key={t._id}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 transition-all shadow-sm text-left"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-foreground">
                    {t.name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {t.style}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1">
                    📍 {t.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {t.duration} Days
                  </span>
                  <span className="flex items-center gap-1 font-bold text-foreground">
                    💰 {t.budget}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                <button
                  onClick={() => setSelectedTrip(t)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full gradient-saffron text-primary-foreground font-semibold text-xs shadow-card hover:opacity-95 active:scale-[0.98] transition-transform text-center"
                >
                  View Itinerary
                </button>
                <button
                  onClick={() => handleDeleteTrip(t._id)}
                  className="p-2 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:scale-95 transition-transform"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedTrips;
