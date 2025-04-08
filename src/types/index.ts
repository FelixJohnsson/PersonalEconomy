export type NecessityLevel = "F" | "E" | "D" | "C" | "B" | "A" | "A+";

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Lunch",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Personal Care",
  "Education",
  "Clothing",
  "Electronics",
  "Debt Payments",
  "Savings",
  "Gifts & Donations",
  "Travel",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number] | string;

export const ASSET_CATEGORIES = [
  "cash",
  "investment",
  "stock",
  "crypto",
  "property",
  "vehicle",
  "collectible",
  "other",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number] | string;

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency?: "monthly" | "annual"; // Optional since it only applies to recurring expenses
  category: string;
  isRecurring: boolean;
  date?: string; // date of expense or due date for recurring expenses
  notes?: string;
  necessityLevel?: NecessityLevel;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "annual";
  billingCycle?: "monthly" | "annual";
  renewalDate?: string;
  autoRenews?: boolean;
  category: string;
  billingDate: string;
  notes?: string;
  isActive: boolean;
  necessityLevel?: NecessityLevel;
}

export interface AssetValue {
  date: string;
  value: number;
  isDeposit?: boolean;
  depositAmount?: number;
}

export interface AssetDeposit {
  date: string;
  amount: number;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetCategory;
  value: number;
  savingsGoalId?: string | null;
  historicalValues?: AssetValue[]; // Keep for backward compatibility
  totalDeposits?: number; // Keep for backward compatibility
  values?: AssetValue[]; // MongoDB model uses this
  deposits?: AssetDeposit[]; // MongoDB model uses this
  notes?: string;
}

export interface ExpenseSummary {
  category: string;
  amount: number;
}

export interface Period {
  startDate: string;
  endDate: string;
}

export enum IncomeFrequency {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  DAILY = "daily",
}

export interface IncomeFormData {
  name: string;
  grossAmount: number;
  netAmount: number;
  taxRate: number;
  frequency: IncomeFrequency;
  isRecurring: boolean;
  type: string;
  date: string;
}

export interface Income extends IncomeFormData {
  _id: string;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  interestRate: number;
  minimumPayment: number;
  type: "credit_card" | "loan" | "mortgage" | "other";
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  startDate: string;
  targetDate: string;
  monthlySavings: number;
  expectedReturnRate: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  periodStartDate: string;
  periodEndDate: string;
}

export interface SavingsProjection {
  months: number[];
  savings: number[];
  interest: number[];
  total: number[];
}

export interface BudgetItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface TaxReturn {
  id: string;
  year: number;
  declaredIncome: number;
  taxPaid: number;
  returnAmount: number; // Positive for refunds, negative for additional payments
  submissionDate: string;
  notes?: string;
}

export * from "./Note";

// Export form types
export * from "./forms";

// Define MongoDB specific types
export type MongoId = string;

/**
 * Base MongoDB document type with _id field
 */
export interface MongoDoc {
  _id: MongoId;
}

/**
 * Type utility to convert client-side types to MongoDB types
 * Adds _id field and converts id to _id
 */
export type WithMongoId<T extends { id: string }> = Omit<T, "id"> & MongoDoc;

/**
 * Type utility to convert MongoDB types to client-side types
 * Renames _id to id and ensures proper typing
 */
export type WithClientId<T extends MongoDoc> = Omit<T, "_id"> & { id: string };

/**
 * Base form data type without ID (for creating new records)
 */
export type FormData<T extends { id: string }> = Omit<T, "id">;
