import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { subscriptionSchema, ISubscription } from "./subscriptionModel";
import Income, { IIncome } from "./incomeModel";
import Expense, { IExpense } from "./expenseModel";
import Asset, { IAsset } from "./assetModel";
import Liability, { ILiability } from "./liabilityModel";

export enum Frequency {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  DAILY = "daily",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}
export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isSetupComplete: boolean;
  // Add embedded data arrays
  incomes: IIncome[];
  expenses: IExpense[];
  assets: IAsset[];
  liabilities: ILiability[];
  subscriptions: ISubscription[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// Create schemas from models to embed in user
const incomeSchema = (Income as any).schema;
const expenseSchema = (Expense as any).schema;
const assetSchema = (Asset as any).schema;
const liabilitySchema = (Liability as any).schema;

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        // eslint-disable-next-line no-useless-escape
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    isSetupComplete: {
      type: Boolean,
      default: false,
    },
    // Add embedded data arrays
    incomes: [incomeSchema],
    expenses: [expenseSchema],
    assets: [assetSchema],
    liabilities: [liabilitySchema],
    subscriptions: [subscriptionSchema],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env.JWT_SECRET || "defaultsecret";
  const expiry = process.env.JWT_EXPIRE || "30d";

  // @ts-ignore - Ignoring type checking for this call due to typescript's jsonwebtoken issues
  return jwt.sign({ id: this._id }, secret, { expiresIn: expiry });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
