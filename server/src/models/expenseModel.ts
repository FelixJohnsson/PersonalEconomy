import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface IExpense extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  amount: number;
  category: string;
  isRecurring: boolean;
  date: string;
  necessityLevel?: string;
  frequency?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new mongoose.Schema<IExpense>(
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
    category: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    date: {
      type: String,
      required: true,
    },
    necessityLevel: {
      type: String,
    },
    frequency: {
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

const Expense = mongoose.model<IExpense>("Expense", expenseSchema);

export default Expense;
