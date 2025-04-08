import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IAsset extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  value: number;
  type: string;
  acquisitionDate?: string;
  notes?: string;
  category?: string;
  growthRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new mongoose.Schema<IAsset>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    value: {
      type: Number,
      required: [true, "Please add a value"],
    },
    type: {
      type: String,
      required: true,
    },
    acquisitionDate: {
      type: String,
    },
    notes: {
      type: String,
    },
    category: {
      type: String,
    },
    growthRate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model<IAsset>("Asset", assetSchema);

export default Asset;
