import mongoose from "mongoose";
import { Frequency, IUser } from "./userModel";

export interface IIncome extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  grossAmount: number;
  netAmount: number;
  taxRate: number;
  frequency: Frequency;
  type: string;
  date: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeType {
  date: string;
  frequency: Frequency;
  grossAmount: number;
  isRecurring: boolean;
  name: string;
  netAmount: number;
  taxRate: number;
  type: string;
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
      enum: ["monthly", "annual", "weekly", "biweekly", "daily", "quarterly"],
    },
    type: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.model<IIncome>("Income", incomeSchema);

export default Income;
