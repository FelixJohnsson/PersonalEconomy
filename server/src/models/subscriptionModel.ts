import mongoose from "mongoose";
import { IUser } from "./userModel";

export interface ISubscription extends mongoose.Document {
  user: IUser["_id"];
  name: string;
  amount: number;
  frequency: string;
  category: string;
  billingDate: string;
  necessityLevel: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionType {
  name: string;
  amount: number;
  frequency: string;
  category: string;
  billingDate: string;
  necessityLevel: string;
  active: boolean;
}

export const subscriptionSchema = new mongoose.Schema<ISubscription>(
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
    frequency: {
      type: String,
    },
    category: {
      type: String,
    },
    billingDate: {
      type: String,
    },
    necessityLevel: {
      type: String,
    },
    active: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);

export default Subscription;
