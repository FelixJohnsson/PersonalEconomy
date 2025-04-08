import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface ILiability extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  amount: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const liabilitySchema = new mongoose.Schema<ILiability>(
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
    interestRate: {
      type: Number,
    },
    minimumPayment: {
      type: Number,
    },
    dueDate: {
      type: String,
    },
    category: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Liability = mongoose.model<ILiability>("Liability", liabilitySchema);

export default Liability;
