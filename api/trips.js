import { supabase } from "./_utils/db.js";
import { getSessionFromReq } from "./_utils/auth.js";

/**
 * Trips API Handler
 * Clean Architecture Enforcement:
 * - Trips reside EXCLUSIVELY in Supabase (trips table).
 * - MongoDB is NOT used here (only wishlists & feedbacks reside in MongoDB).
 * - Multi-device Gmail access: Any device logged into the same Google account accesses the user's trips.
 */
export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;

  try {
    // 1. GET: Fetch Saved Trips strictly from Supabase
    if (req.method === "GET") {
      let query = supabase.from("trips").select("*");
      if (userEmail) {
        query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
      } else {
        query = query.eq("user_id", userId);
      }

      const { data: trips, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase GET trips error:", error);
        return res.status(500).json({ error: error.message || "Failed to fetch trips from Supabase" });
      }

      const mappedTrips = (trips || []).map((t) => ({
        ...t,
        _id: String(t.id),
        id: String(t.id),
      }));

      return res.status(200).json({ trips: mappedTrips });
    }

    // 2. POST: Save New Trip strictly to Supabase
    if (req.method === "POST") {
      const { name, destination, duration, style, budget, itinerary } = req.body;

      if (!name || !destination || !duration || !style || !budget || !itinerary) {
        return res.status(400).json({ error: "Missing required trip details" });
      }

      const { data: trip, error } = await supabase
        .from("trips")
        .insert([
          {
            user_id: userId,
            name,
            destination,
            duration: Number(duration),
            style,
            budget,
            itinerary,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase POST trip error:", error);
        return res.status(500).json({ error: error.message || "Failed to save trip to Supabase" });
      }

      const mappedTrip = {
        ...trip,
        _id: String(trip.id),
        id: String(trip.id),
      };

      return res.status(201).json({ success: true, trip: mappedTrip });
    }

    // 3. PUT: Update Trip Name or Details strictly in Supabase
    if (req.method === "PUT") {
      const id = req.query.id || req.body.id;
      const { name, destination, duration, style, budget, itinerary } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (destination !== undefined) updates.destination = destination;
      if (duration !== undefined) updates.duration = Number(duration);
      if (style !== undefined) updates.style = style;
      if (budget !== undefined) updates.budget = budget;
      if (itinerary !== undefined) updates.itinerary = itinerary;
      updates.updated_at = new Date().toISOString();

      let query = supabase.from("trips").update(updates).eq("id", id);
      if (userEmail) {
        query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
      } else {
        query = query.eq("user_id", userId);
      }

      const { data: trip, error } = await query.select().maybeSingle();

      if (error) {
        console.error("Supabase PUT trip error:", error);
        return res.status(500).json({ error: error.message || "Failed to update trip in Supabase" });
      }

      if (!trip) {
        return res.status(404).json({ error: "Trip not found or unauthorized." });
      }

      const mappedTrip = {
        ...trip,
        _id: String(trip.id),
        id: String(trip.id),
      };

      return res.status(200).json({ success: true, trip: mappedTrip });
    }

    // 4. DELETE: Delete Trip strictly from Supabase
    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      let query = supabase.from("trips").delete().eq("id", id);
      if (userEmail) {
        query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
      } else {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.select();

      if (error) {
        console.error("Supabase DELETE trip error:", error);
        return res.status(500).json({ error: error.message || "Failed to delete trip from Supabase" });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Trip not found or unauthorized." });
      }

      return res.status(200).json({ success: true, message: "Trip deleted successfully." });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Trips API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
