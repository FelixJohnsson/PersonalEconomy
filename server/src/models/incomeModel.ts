import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IIncome extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  amount: number;
  grossAmount?: number;
  netAmount?: number;
  taxRate?: number;
  frequency: "monthly" | "annual";
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new mongoose.Schema<IIncome>(
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
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    grossAmount: {
      type: Number,
    },
    netAmount: {
      type: Number,
    },
    taxRate: {
      type: Number,
    },
    frequency: {
      type: String,
      required: true,
      enum: ["monthly", "annual"],
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model<IIncome>("Income", incomeSchema);

export default Income;
