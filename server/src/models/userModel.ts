import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export enum IncomeFrequency {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  DAILY = "daily",
}

// Income interface
export interface IncomeFromClient {
  name: string;
  grossAmount: number;
  netAmount: number;
  taxRate: number;
  frequency: IncomeFrequency;
  isRecurring: boolean;
  type: string;
  date: string;
}

export interface Income extends IncomeFromClient {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Expense interface
export interface Expense {
  _id?: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  category: string;
  isRecurring: boolean;
  date: string;
  necessityLevel?: string;
  frequency?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Asset Value interface
export interface AssetValue {
  _id?: mongoose.Types.ObjectId;
  date: string;
  value: number;
}

// Asset Deposit interface
export interface AssetDeposit {
  _id?: mongoose.Types.ObjectId;
  date: string;
  amount: number;
  notes?: string;
}

// Asset interface
export interface Asset {
  _id?: mongoose.Types.ObjectId;
  name: string;
  type: string;
  value: number;
  initialValue: number;
  purchaseDate: string;
  category: string;
  notes?: string;
  values?: AssetValue[];
  deposits?: AssetDeposit[];
  savingsGoalId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// Liability interface
export interface Liability {
  _id?: mongoose.Types.ObjectId;
  name: string;
  type: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isSetupComplete: boolean;
  // Add embedded data arrays
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  liabilities: Liability[];
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

// Income schema
const incomeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
);

// Expense schema
const expenseSchema = new mongoose.Schema(
  {
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
  { _id: true, timestamps: true }
);

// Asset value schema
const assetValueSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

// Asset deposit schema
const assetDepositSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
});

// Asset schema
const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    initialValue: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    values: [assetValueSchema],
    deposits: [assetDepositSchema],
    savingsGoalId: {
      type: String,
      default: null,
    },
  },
  { _id: true, timestamps: true }
);

// Liability schema
const liabilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    minimumPayment: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { _id: true, timestamps: true }
);

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
