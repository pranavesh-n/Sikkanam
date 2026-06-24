import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

WishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

