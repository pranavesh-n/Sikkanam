import { supabase } from "./utils/db.js";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_key_change_me";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Please log in." });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid session." });
  }

  try {
    if (req.method === "GET") {
      const { data: trips, error } = await supabase
        .from("trips")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase GET trips error:", error);
        return res.status(500).json({ error: "Database error fetching trips." });
      }

      return res.status(200).json({ trips });
    }

    if (req.method === "POST") {
      const { name, destination, duration, style, budget, itinerary } = req.body;
      
      if (!name || !destination || !duration || !style || !budget || !itinerary) {
        return res.status(400).json({ error: "Missing required trip details" });
      }

      const { data: trip, error } = await supabase
        .from("trips")
        .insert([{
          user_id: userId,
          name,
          destination,
          duration: Number(duration),
          style,
          budget,
          itinerary,
        }])
        .select()
        .single();

      if (error) {
        console.error("Supabase POST trip error:", error);
        return res.status(500).json({ error: "Database error saving trip." });
      }

      return res.status(201).json({ success: true, trip });
    }

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

      const { data: trip, error } = await supabase
        .from("trips")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Supabase PUT trip error:", error);
        return res.status(500).json({ error: "Database error updating trip." });
      }

      if (!trip) {
        return res.status(404).json({ error: "Trip not found or unauthorized." });
      }

      return res.status(200).json({ success: true, trip });
    }

    if (req.method === "DELETE") {
      const id = req.query.id || req.body.id;

      if (!id) {
        return res.status(400).json({ error: "Missing trip ID" });
      }

      const { data, error } = await supabase
        .from("trips")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select();

      if (error) {
        console.error("Supabase DELETE trip error:", error);
        return res.status(500).json({ error: "Database error deleting trip." });
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
