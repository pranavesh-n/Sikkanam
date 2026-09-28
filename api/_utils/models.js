import mongoose from "mongoose";
import { serverConfig } from "./config.js";

/**
 * MongoDB Models for Sikkanam:
 * Architecture Rule: ONLY `wishlists` and `feedbacks` reside in MongoDB.
 * Saved Trips & Itineraries reside strictly in Supabase (trips table).
 */

// 1. Wishlist Destinations (MongoDB Collection: wishlists)
const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

WishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

// 2. User Feedback & Queries (MongoDB Collection: feedbacks)
const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, default: "anonymous" },
  type: { type: String, required: true },
  message: { type: String, required: true },
  appVersion: { type: String, default: serverConfig.appVersion },
  deviceInfo: { type: String, default: "" },
  status: { type: String, default: "received" },
  createdAt: { type: Date, default: Date.now }
});

export const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
