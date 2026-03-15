import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  provider: "google" | "github";
  providerId: string; // Google sub or GitHub id
  picture?: string;
  credits: number;
  plan?: string; // starter, professional, power
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    provider: { type: String, enum: ["google", "github"], required: true },
    providerId: { type: String, required: true },
    picture: { type: String },
    credits: { type: Number, default: 0 },
    plan: { type: String, default: "free" },
    stripeCustomerId: { type: String },
  },
  { timestamps: true },
);

// Create compound index for provider + ID (though email is usually unique enough)
UserSchema.index({ provider: 1, providerId: 1 });

export const UserModel = mongoose.model<IUser>("User", UserSchema);
