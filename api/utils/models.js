import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  destinationId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

WishlistSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

const UserSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  email: { type: String },
  appLockEnabled: { type: Boolean, default: false },
  appLockPinHash: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

export const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
export const UserSettings = mongoose.models.UserSettings || mongoose.model("UserSettings", UserSettingsSchema);
