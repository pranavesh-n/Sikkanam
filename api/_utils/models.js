import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

WishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  style: { type: String, required: true },
  budget: { type: String, required: true },
  itinerary: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Trip = mongoose.models.Trip || mongoose.model("Trip", TripSchema);
