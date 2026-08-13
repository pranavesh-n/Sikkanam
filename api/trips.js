import { supabase, connectToDatabase } from "./_utils/db.js";
import { Trip } from "./_utils/models.js";
import { getSessionFromReq } from "./_utils/auth.js";

export default async function handler(req, res) {
  const decoded = getSessionFromReq(req);

  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  const userId = decoded.id;

  try {
    // 1. Primary Database Engine: Supabase
    if (req.method === "GET") {
      try {
        const { data: trips, error } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(trips)) {
          const mappedTrips = trips.map((t) => ({
            ...t,
            _id: t.id,
          }));
          return res.status(200).json({ trips: mappedTrips });
        }
      } catch (e) {
        console.warn("Supabase GET trips failed, trying fallback...", e?.message);
      }

      // Fallback Engine: MongoDB
      await connectToDatabase();
      const mongoTrips = await Trip.find({ userId }).sort({ createdAt: -1 });
      const mappedTrips = mongoTrips.map((t) => ({
        ...t.toObject(),
        _id: t._id.toString(),
        id: t._id.toString(),
      }));
      return res.status(200).json({ trips: mappedTrips });
    }

    if (req.method === "POST") {
      const { name, destination, duration, style, budget, itinerary } = req.body;

      if (!name || !destination || !duration || !style || !budget || !itinerary) {
        return res.status(400).json({ error: "Missing required trip details" });
      }

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
          const mappedTrip = {
            ...trip,
            _id: trip.id,
          };
          return res.status(201).json({ success: true, trip: mappedTrip });
        }
      } catch (e) {
        console.warn("Supabase POST trip failed, trying fallback...", e?.message);
      }

      // Fallback Engine: MongoDB
      await connectToDatabase();
      const newTrip = new Trip({
        userId,
        name,
        destination,
        duration: Number(duration),
        style,
        budget,
        itinerary,
      });
      await newTrip.save();
      const mappedTrip = {
        ...newTrip.toObject(),
        _id: newTrip._id.toString(),
        id: newTrip._id.toString(),
      };
      return res.status(201).json({ success: true, trip: mappedTrip });
    }

    if (req.method === "PUT") {
      const id = req.query.id || req.body.id;
      const { name, destination, duration, style, budget, itinerary } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      try {
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (destination !== undefined) updates.destination = destination;
        if (duration !== undefined) updates.duration = Number(duration);
        if (style !== undefined) updates.style = style;
        if (budget !== undefined) updates.budget = budget;
        if (itinerary !== undefined) updates.itinerary = itinerary;
        updates.updated_at = new Date().toISOString();

        const { data: trip, error } = await supabase
          .from("trips")
          .update(updates)
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .maybeSingle();

        if (!error && trip) {
          const mappedTrip = {
            ...trip,
            _id: trip.id,
          };
          return res.status(200).json({ success: true, trip: mappedTrip });
        }
      } catch (e) {
        console.warn("Supabase PUT trip failed, trying fallback...", e?.message);
      }

      // Fallback Engine: MongoDB
      await connectToDatabase();
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (destination !== undefined) updates.destination = destination;
      if (duration !== undefined) updates.duration = Number(duration);
      if (style !== undefined) updates.style = style;
      if (budget !== undefined) updates.budget = budget;
      if (itinerary !== undefined) updates.itinerary = itinerary;
      updates.updatedAt = new Date();

      const updatedTrip = await Trip.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true }
      );

      if (!updatedTrip) {
        return res.status(404).json({ error: "Trip not found or unauthorized." });
      }

      const mappedTrip = {
        ...updatedTrip.toObject(),
        _id: updatedTrip._id.toString(),
        id: updatedTrip._id.toString(),
      };
      return res.status(200).json({ success: true, trip: mappedTrip });
    }

    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      try {
        const { data, error } = await supabase
          .from("trips")
          .delete()
          .eq("id", id)
          .eq("user_id", userId)
          .select();

        if (!error && data && data.length > 0) {
          return res.status(200).json({ success: true, message: "Trip deleted successfully." });
        }
      } catch (e) {
        console.warn("Supabase DELETE trip failed, trying fallback...", e?.message);
      }

      // Fallback Engine: MongoDB
      await connectToDatabase();
      const result = await Trip.deleteOne({ _id: id, userId });
      if (result.deletedCount === 0) {
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
