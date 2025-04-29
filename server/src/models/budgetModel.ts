import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IBudget extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  amount: number;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  recurrence?: string;
  tracking?: {
    date: Date;
    amount: number;
    description?: string;
  }[];
}

const trackingSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
});

const BudgetSchema = new mongoose.Schema<IBudget>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    recurrence: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
    },
    tracking: [trackingSchema],
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;
