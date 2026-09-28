import { supabase, connectToDatabase } from "./_utils/db.js";
import { getSessionFromReq } from "./_utils/auth.js";
import mongoose from "mongoose";

/**
 * Trips API Handler
 * Architecture:
 * - ONLY `wishlists` and `feedbacks` belong in MongoDB.
 * - Saving & managing trips belongs strictly in Supabase (trips table).
 * - Cross-device Gmail access: Any device logged into the same Gmail account can access all saved trips.
 */

let migrationAttempted = false;

async function migrateLegacyMongoTrips() {
  if (migrationAttempted) return;
  migrationAttempted = true;
  try {
    await connectToDatabase();
    const rawDb = mongoose.connection?.db;
    if (rawDb) {
      const collections = await rawDb.listCollections({ name: "trips" }).toArray();
      if (collections.length > 0) {
        const mongoTrips = await rawDb.collection("trips").find({}).toArray();
        for (const t of mongoTrips) {
          await supabase.from("trips").insert([
            {
              user_id: t.userId,
              name: t.name,
              destination: t.destination,
              duration: Number(t.duration) || 1,
              style: t.style || "standard",
              budget: t.budget || "₹0",
              itinerary: t.itinerary,
              created_at: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
              updated_at: t.updatedAt ? new Date(t.updatedAt).toISOString() : new Date().toISOString(),
            },
          ]);
        }
        // Drop trips collection from MongoDB so ONLY wishlists and feedbacks remain
        await rawDb.collection("trips").drop().catch(() => {});
      }
    }
  } catch (err) {
    // Graceful silent ignore if already dropped or no legacy trips
  }
}

export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;

  // Ensure any legacy trips in MongoDB are migrated to Supabase and removed from MongoDB
  await migrateLegacyMongoTrips();

  try {
    // 1. Fetch Saved Trips from Supabase (accessible across any device for this Gmail / User)
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
        _id: t.id,
        id: t.id,
      }));
      return res.status(200).json({ trips: mappedTrips });
    }

    // 2. Save New Trip Strictly to Supabase
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
        _id: trip.id,
        id: trip.id,
      };
      return res.status(201).json({ success: true, trip: mappedTrip });
    }

    // 3. Update Existing Trip in Supabase
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
        _id: trip.id,
        id: trip.id,
      };
      return res.status(200).json({ success: true, trip: mappedTrip });
    }

    // 4. Delete Trip from Supabase
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
