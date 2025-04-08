import mongoose from "mongoose";
import { IUser } from "./userModel";

// Define interfaces for asset value history and deposits
interface AssetValue {
  date: string;
  value: number;
}

interface AssetDeposit {
  date: string;
  amount: number;
  notes?: string;
}

export interface IAsset extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  value: number;
  type: string;
  acquisitionDate?: string;
  notes?: string;
  category?: string;
  growthRate?: number;
  initialValue?: number;
  purchaseDate?: string;
  savingsGoalId?: string | null;
  values?: AssetValue[];
  deposits?: AssetDeposit[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetType {
  name: string;
  value: number;
  type: string;
  acquisitionDate?: string;
  notes?: string;
  category?: string;
  growthRate?: number;
  initialValue?: number;
  purchaseDate?: string;
  savingsGoalId?: string | null;
  values?: AssetValue[];
  deposits?: AssetDeposit[];
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
    initialValue: {
      type: Number,
    },
    purchaseDate: {
      type: String,
    },
    savingsGoalId: {
      type: String,
      default: null,
    },
    values: [
      {
        date: String,
        value: Number,
      },
    ],
    deposits: [
      {
        date: String,
        amount: Number,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Asset = mongoose.model<IAsset>("Asset", assetSchema);

export default Asset;
