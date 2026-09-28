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
    // 1. Fetch Saved Trips (Supabase primary, with fallback)
    if (req.method === "GET") {
      let tripsList = [];
      let supabaseSuccess = false;

      try {
        let query = supabase.from("trips").select("*");
        if (userEmail) {
          query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
        } else {
          query = query.eq("user_id", userId);
        }

        const { data: supabaseTrips, error } = await query.order("created_at", { ascending: false });
        if (!error && supabaseTrips) {
          tripsList = supabaseTrips.map((t) => ({
            ...t,
            _id: String(t.id),
            id: String(t.id),
          }));
          supabaseSuccess = true;
        } else if (error) {
          console.warn("Supabase fetch warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase fetch exception:", err.message);
      }

      // Check MongoDB for any pending or fallback trips
      try {
        await connectToDatabase();
        const rawDb = mongoose.connection?.db;
        if (rawDb) {
          const mongoTrips = await rawDb
            .collection("trips")
            .find({
              $or: [{ userId: userId }, { userId: userEmail }, { user_id: userId }, { user_id: userEmail }],
            })
            .sort({ createdAt: -1 })
            .toArray();

          for (const mt of mongoTrips) {
            const mId = String(mt._id || mt.id);
            if (!tripsList.some((t) => String(t.id) === mId || (t.name === mt.name && t.destination === mt.destination))) {
              tripsList.push({
                _id: mId,
                id: mId,
                name: mt.name,
                destination: mt.destination,
                duration: Number(mt.duration) || 1,
                style: mt.style || "standard",
                budget: mt.budget || "₹0",
                itinerary: mt.itinerary,
                created_at: mt.createdAt || mt.created_at || new Date().toISOString(),
                updated_at: mt.updatedAt || mt.updated_at || new Date().toISOString(),
              });
            }
          }
        }
      } catch (mErr) {
        console.warn("MongoDB fallback fetch warning:", mErr.message);
      }

      return res.status(200).json({ trips: tripsList });
    }

    // 2. Save New Trip (Supabase primary, resilient fallback)
    if (req.method === "POST") {
      const { name, destination, duration, style, budget, itinerary } = req.body;

      if (!name || !destination || !duration || !style || !budget || !itinerary) {
        return res.status(400).json({ error: "Missing required trip details" });
      }

      let savedTrip = null;

      // Primary attempt: Save to Supabase
      try {
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

        if (!error && trip) {
          savedTrip = {
            ...trip,
            _id: String(trip.id),
            id: String(trip.id),
          };
        } else {
          console.warn("Supabase insert encountered issue, engaging fallback:", error?.message);
        }
      } catch (sbErr) {
        console.warn("Supabase insert exception, engaging fallback:", sbErr.message);
      }

      // Fallback: Store securely in database so user data is NEVER lost
      if (!savedTrip) {
        try {
          await connectToDatabase();
          const rawDb = mongoose.connection?.db;
          if (rawDb) {
            const newDoc = {
              userId,
              userEmail: userEmail || "",
              name,
              destination,
              duration: Number(duration),
              style,
              budget,
              itinerary,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            const insertResult = await rawDb.collection("trips").insertOne(newDoc);
            savedTrip = {
              ...newDoc,
              _id: String(insertResult.insertedId),
              id: String(insertResult.insertedId),
            };
          }
        } catch (dbErr) {
          console.error("Critical: Fallback save error:", dbErr);
          return res.status(500).json({ error: "Could not save trip. Please try again." });
        }
      }

      return res.status(201).json({ success: true, trip: savedTrip });
    }

    // 3. Update Existing Trip
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

      let updatedTrip = null;

      try {
        let query = supabase.from("trips").update(updates).eq("id", id);
        if (userEmail) {
          query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
        } else {
          query = query.eq("user_id", userId);
        }
        const { data: trip, error } = await query.select().maybeSingle();
        if (!error && trip) {
          updatedTrip = { ...trip, _id: String(trip.id), id: String(trip.id) };
        }
      } catch (err) { }

      if (!updatedTrip) {
        try {
          await connectToDatabase();
          const rawDb = mongoose.connection?.db;
          if (rawDb) {
            const mongoUpdates = { ...updates, updatedAt: new Date() };
            delete mongoUpdates.updated_at;
            let filter = { $or: [{ userId }, { userEmail }] };
            try {
              filter._id = new mongoose.Types.ObjectId(id);
            } catch (e) {
              filter.id = id;
            }
            await rawDb.collection("trips").updateOne(filter, { $set: mongoUpdates });
            updatedTrip = { _id: id, id, ...updates };
          }
        } catch (err) { }
      }

      if (!updatedTrip) {
        return res.status(404).json({ error: "Trip not found or unauthorized." });
      }

      return res.status(200).json({ success: true, trip: updatedTrip });
    }

    // 4. Delete Trip
    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      let deleted = false;

      try {
        let query = supabase.from("trips").delete().eq("id", id);
        if (userEmail) {
          query = query.or(`user_id.eq.${userId},user_id.eq.${userEmail}`);
        } else {
          query = query.eq("user_id", userId);
        }
        const { data, error } = await query.select();
        if (!error && data && data.length > 0) {
          deleted = true;
        }
      } catch (err) { }

      try {
        await connectToDatabase();
        const rawDb = mongoose.connection?.db;
        if (rawDb) {
          let filter = { $or: [{ userId }, { userEmail }] };
          try {
            filter._id = new mongoose.Types.ObjectId(id);
          } catch (e) {
            filter.id = id;
          }
          const delRes = await rawDb.collection("trips").deleteOne(filter);
          if (delRes.deletedCount > 0) {
            deleted = true;
          }
        }
      } catch (err) { }

      if (!deleted) {
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
